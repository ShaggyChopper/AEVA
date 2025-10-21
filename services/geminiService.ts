import { GoogleGenAI, Type } from "@google/genai";
import type { Transaction, ReceiptData, CategoryRuleMap, Rule503020Bucket } from '../types';
import { getFinancialMonthRange } from '../utils/date';
import { SUPPORTED_CURRENCIES } from "../constants";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const receiptSchema = {
    type: Type.OBJECT,
    properties: {
        merchant: {
            type: Type.STRING,
            description: "The name of the store or merchant from the receipt."
        },
        date: {
            type: Type.STRING,
            description: "The date of the transaction in YYYY-MM-DD format. If not found, use today's date."
        },
        currency: {
            type: Type.STRING,
            description: "The 3-letter currency code (e.g., 'USD', 'EUR', 'GBP') found on the receipt. If not found, assume 'USD'."
        },
        items: {
            type: Type.ARRAY,
            description: "List of all items purchased from the receipt.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: "The name of the item. Be concise. e.g., '1kg Chicken' or 'Milk 1L'."
                    },
                    price: {
                        type: Type.NUMBER,
                        description: "The price of the item."
                    }
                },
                required: ["name", "price"]
            }
        },
        total: {
            type: Type.NUMBER,
            description: "The total amount on the receipt."
        },
        tax: {
            type: Type.NUMBER,
            description: "The total tax amount (e.g., VAT, Sales Tax) on the receipt. If not found, set to 0."
        }
    },
    required: ["merchant", "date", "currency", "items", "total"]
};

const merchantSchema = {
    type: Type.OBJECT,
    properties: {
        merchant: {
            type: Type.STRING,
            description: "The name of the store or merchant from the receipt. If no clear merchant name is found, return an empty string."
        }
    },
    required: ["merchant"]
};

export const detectMerchant = async (base64ImageData: string): Promise<string> => {
    const prompt = "Analyze this receipt image and identify the merchant's name. Return only the merchant name in the specified JSON format.";
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64ImageData,
            },
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: merchantSchema
            }
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as { merchant: string };
        return result.merchant || '';

    } catch (error) {
        console.error("Gemini API call failed for merchant detection:", error);
        // Return empty string on failure to not disrupt user flow
        return '';
    }
};

export const processReceipt = async (base64ImageData: string): Promise<ReceiptData> => {
    const prompt = `
        Analyze this receipt image. Extract the following information:
        1. The name of the merchant/store.
        2. The date of the transaction. If you can't find one, use today's date. Format it as YYYY-MM-DD.
        3. The 3-letter currency code (e.g., USD, EUR, SEK). If you can't find it, assume the local currency based on the store or language, but make a reasonable guess.
        4. A list of all individual items purchased, along with their price. Make item names descriptive (e.g., 'Milk 1L' instead of just 'Milk').
        5. The total amount paid.
        6. The total tax amount (e.g., VAT, Sales Tax). If there is no tax, this should be 0.
        
        Please provide the response in the specified JSON format. The sum of item prices plus tax should ideally equal the total.
    `;
    
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64ImageData,
            },
        };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: receiptSchema
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ReceiptData;

    } catch (error) {
        console.error("Gemini API call failed for receipt processing:", error);
        throw new Error("Failed to analyze receipt. The AI model might be unavailable or the image could not be processed.");
    }
};


export const getFinancialFeedback = async (
    transactions: Transaction[],
    primaryCurrency: string,
    categoryRuleMap: CategoryRuleMap
): Promise<string> => {
    if (transactions.length < 5) {
        return "Add a few more transactions to get detailed feedback and price comparisons.";
    }

    const transactionDataForAI = transactions
      .filter(t => t.category !== 'Income')
      .map(t => ({
          item: t.name,
          price: t.amount, // Note: This is the converted amount
          category: t.category,
          merchant: t.merchant,
          date: t.date
      }));

    // Calculate current financial period stats for 50/30/20 rule
    const { startDate, endDate } = getFinancialMonthRange();
    const monthlyTransactions = transactions.filter(t => t.date >= startDate && t.date <= endDate);

    const currencySymbol = SUPPORTED_CURRENCIES[primaryCurrency]?.symbol || primaryCurrency;

    let monthlyIncome = 0;
    const monthlyRuleTotals: Record<Rule503020Bucket, number> = { Needs: 0, Wants: 0, Savings: 0 };

    for (const t of monthlyTransactions) {
        if (t.category === 'Income') {
            monthlyIncome += t.amount;
        } else {
            const bucket = categoryRuleMap[t.category];
            if (bucket) {
                monthlyRuleTotals[bucket] += t.amount;
            }
        }
    }

    let promptAnalysisSection = '';
    let promptInstructionPoints = '';

    if (monthlyIncome > 0) {
        const totalMonthlySpending = monthlyRuleTotals.Needs + monthlyRuleTotals.Wants + monthlyRuleTotals.Savings;
        const actualSavings = monthlyIncome - totalMonthlySpending;
        
        promptAnalysisSection = `
        Your spending for the current financial period is being analyzed against the 50/30/20 budget rule (50% Needs, 30% Wants, 20% Savings).
        Your income for this period is ${currencySymbol}${monthlyIncome.toFixed(2)}.

        Your breakdown:
        - Needs: ${currencySymbol}${monthlyRuleTotals.Needs.toFixed(2)} (${(monthlyRuleTotals.Needs / monthlyIncome * 100).toFixed(0)}% of income. Target: 50%)
        - Wants: ${currencySymbol}${monthlyRuleTotals.Wants.toFixed(2)} (${(monthlyRuleTotals.Wants / monthlyIncome * 100).toFixed(0)}% of income. Target: 30%)
        - Savings & Debt Repayment: ${currencySymbol}${actualSavings.toFixed(2)} (${(actualSavings / monthlyIncome * 100).toFixed(0)}% of income. Target: 20%)
        `;
        
        promptInstructionPoints = `
        1. A brief, encouraging opening.
        2. An analysis of their 50/30/20 breakdown. Point out where they are on or off track and provide specific, actionable advice based on their transactions. For example, if 'Wants' are too high, suggest specific areas to cut back.
        3. An observation about the category with the highest spending.
        4. **Crucially, identify if the user bought similar items (e.g., 'Milk', 'Chicken', 'Coffee') at different stores. If so, compare the prices and suggest which store is cheaper for that item.** For example: "I noticed you bought '1kg Chicken' at Lidl for ${currencySymbol}8.50 and at ICA for ${currencySymbol}10.20. You could save money by buying your chicken at Lidl!". Be specific. If no direct comparisons can be made, skip this point.
        5. One or two other practical and actionable suggestions for areas where they could save money.
        6. A positive concluding remark.
        `;

    } else {
        promptInstructionPoints = `
        1. A brief, encouraging opening.
        2. An observation about the category with the highest spending.
        3. **Crucially, identify if the user bought similar items (e.g., 'Milk', 'Chicken', 'Coffee') at different stores. If so, compare the prices and suggest which store is cheaper for that item.** For example: "I noticed you bought '1kg Chicken' at Lidl for ${currencySymbol}8.50 and at ICA for ${currencySymbol}10.20. You could save money by buying your chicken at Lidl!". Be specific. If no direct comparisons can be made, skip this point.
        4. One or two other practical and actionable suggestions for areas where they could save money.
        5. A positive concluding remark.
        `;
    }

    const prompt = `
        As a friendly and sharp financial advisor, analyze the following list of user's expenses.
        All monetary values are presented in the user's primary currency: ${primaryCurrency}.
        The user wants to understand their spending habits better and find ways to save money.
        
        ${promptAnalysisSection}

        Expense Data (in ${primaryCurrency}):
        ${JSON.stringify(transactionDataForAI, null, 2)}
        
        Please provide feedback based on all the data provided. Your feedback should include:
        ${promptInstructionPoints}
        
        Keep the tone supportive and helpful, not judgmental. Format the response as a single block of text. Use markdown for simple formatting like bolding if needed.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API call failed for financial feedback:", error);
        throw new Error("Failed to get financial feedback from the AI model.");
    }
};

export const queryTransactions = async (
    question: string,
    transactions: Transaction[],
    primaryCurrency: string
): Promise<string> => {
    if (transactions.length === 0) {
        return "There are no transactions to analyze.";
    }

    // Prepare a more concise version of the transaction data for the prompt
    const transactionDataForAI = transactions.map(t => ({
        name: t.name,
        amount: t.amount,
        currency: primaryCurrency, // All amounts are already converted
        date: t.date,
        merchant: t.merchant,
        category: t.category,
    }));

    const prompt = `
        You are a helpful financial assistant named AEVA. Your task is to answer questions based strictly on the provided JSON data of financial transactions. 
        - Do not make up information or use external knowledge. 
        - If the answer cannot be found in the data, state that clearly. 
        - All monetary values are in ${primaryCurrency}.
        - Be concise and straight to the point in your answer.

        Here is the transaction data:
        ${JSON.stringify(transactionDataForAI, null, 2)}

        Now, please answer the following question:
        "${question}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API call failed for transaction query:", error);
        throw new Error("Failed to get an answer from the AI model.");
    }
};
