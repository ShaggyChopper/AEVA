import { GoogleGenAI, Type } from "@google/genai";
import type { Transaction, ReceiptData } from '../types';

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
        }
    },
    required: ["merchant", "date", "currency", "items", "total"]
};

export const processReceipt = async (base64ImageData: string): Promise<ReceiptData> => {
    const prompt = `
        Analyze this receipt image. Extract the following information:
        1. The name of the merchant/store.
        2. The date of the transaction. If you can't find one, use today's date. Format it as YYYY-MM-DD.
        3. The 3-letter currency code (e.g., USD, EUR, SEK). If you can't find it, assume the local currency based on the store or language, but make a reasonable guess.
        4. A list of all individual items purchased, along with their price. Make item names descriptive (e.g., 'Milk 1L' instead of just 'Milk').
        5. The total amount paid.
        
        Please provide the response in the specified JSON format. Do not include taxes or discounts as separate items, but ensure the total reflects the final amount paid.
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


export const getFinancialFeedback = async (transactions: Transaction[], primaryCurrency: string): Promise<string> => {
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

    const prompt = `
        As a friendly and sharp financial advisor, analyze the following list of user's expenses.
        All monetary values are presented in the user's primary currency: ${primaryCurrency}.
        The user wants to understand their spending habits better and find ways to save money.
        
        Expense Data (in ${primaryCurrency}):
        ${JSON.stringify(transactionDataForAI, null, 2)}
        
        Please provide feedback based on this data. Your feedback should include:
        1. A brief, encouraging opening.
        2. An observation about the category with the highest spending.
        3. **Crucially, identify if the user bought similar items (e.g., 'Milk', 'Chicken', 'Coffee') at different stores. If so, compare the prices and suggest which store is cheaper for that item.** For example: "I noticed you bought '1kg Chicken' at Lidl for ${primaryCurrency} 8.50 and at ICA for ${primaryCurrency} 10.20. You could save money by buying your chicken at Lidl!". Be specific. If no direct comparisons can be made, skip this point.
        4. One or two other practical and actionable suggestions for areas where they could save money.
        5. A positive concluding remark.
        
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