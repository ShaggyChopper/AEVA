
import { GoogleGenAI, Type } from "@google/genai";
import type { Transaction, ReceiptData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const receiptSchema = {
    type: Type.OBJECT,
    properties: {
        date: {
            type: Type.STRING,
            description: "The date of the transaction in YYYY-MM-DD format. If not found, use today's date."
        },
        items: {
            type: Type.ARRAY,
            description: "List of all items purchased from the receipt.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: "The name of the item. Be concise."
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
    required: ["date", "items", "total"]
};

export const processReceipt = async (base64ImageData: string): Promise<ReceiptData> => {
    const prompt = `
        Analyze this receipt image. Extract the following information:
        1. The date of the transaction. If you can't find one, use today's date. Format it as YYYY-MM-DD.
        2. A list of all individual items purchased, along with their price.
        3. The total amount paid.
        
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


export const getFinancialFeedback = async (transactions: Transaction[]): Promise<string> => {
    if (transactions.length === 0) {
        return "No transaction data available to analyze.";
    }

    const summary = transactions.reduce((acc, t) => {
        if (t.category !== 'Income') {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
        }
        return acc;
    }, {} as Record<string, number>);

    const prompt = `
        As a friendly financial advisor, analyze the following expense summary and provide feedback.
        The user wants to understand their spending habits better.
        
        Expense Summary:
        ${JSON.stringify(summary, null, 2)}
        
        Please provide:
        1. A brief, encouraging opening.
        2. An observation about the category with the highest spending.
        3. One or two practical and actionable suggestions for areas where they could potentially save money.
        4. A positive concluding remark.
        
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
