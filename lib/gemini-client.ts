import {GoogleGenAI} from '@google/genai';

/**
 * Extract invoice data from an image or PDF using Gemini
 * @param fileBuffer - The file buffer (image or PDF)
 * @param mimeType - The MIME type of the file
 * @param apiKey - The Gemini API key to use (user's or env)
 */
export async function extractInvoiceData(
  fileBuffer: Buffer,
  mimeType: string,
  apiKey?: string
): Promise<any> {
  // Use provided API key or fallback to environment variable
  const GEMINI_API_KEY = apiKey || process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  // Configure the API key
  const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});
  let selectedModel = process.env.GEMINI_AI_MODEL || "gemini-2.5-flash";

  const prompt = `You are an expert invoice data extraction specialist. Analyze this invoice document (PDF or image) and extract ALL visible information with high accuracy. Return ONLY a valid JSON object in the exact format below. Be very precise with numbers, dates, and text.

{
  "invoiceDate": "Extract the invoice date exactly as written",
  "invoiceNumber": "Extract the invoice number/reference",
  "billedToName": "Customer/client company or person name",
  "billedToAddress": "Complete billing address",
  "billedToGst": "GST number if present",
  "paymentToName": "Vendor/seller company or person name", 
  "paymentToAddress": "Complete vendor address",
  "items": [
    {
      "no": 1,
      "description": "Item/service description",
      "price": 0.0,
      "qty": 1,
      "subtotal": 0.0
    }
  ],
  "paymentDetails": {
    "accountNumber": "Bank account number if visible",
    "ifsc": "IFSC code if visible",
    "accountType": "Account type if mentioned",
    "branch": "Bank branch name if visible",
    "upi": "UPI ID if visible"
  },
  "contactInfo": {
    "phone": "Phone number if visible",
    "email": "Email address if visible", 
    "website": "Website URL if visible"
  },
  "totalAmount": 0.0,
  "currency": "Currency code (INR, USD, etc., if multiple currencies used, then return the one which is detected at first)"
}

IMPORTANT: 
- Extract ALL line items from the invoice
- Use exact numbers and text as shown
- If a field is not found, use null
- Return ONLY the JSON object, no other text
- Ensure all prices and amounts are accurate`;

  // Convert buffer to base64
  const base64Data = fileBuffer.toString("base64");

  const result = await ai.models.generateContent({
    model: selectedModel,
    contents: [
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
      { text: prompt }
    ]
  });

  // Get Gemini's response text robustly
  let text = "";
  if (typeof result.text === "string") {
    text = result.text;
  } else {
    text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  console.log("[Gemini] Raw response:", text);

  // Extract JSON from the response (remove markdown code blocks if present)
  let jsonText = text.trim();
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  } else if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/```\n?/g, "");
  }

  // Try to find JSON object in the response
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonText = jsonMatch[0];
  }

  console.log("[Gemini] Extracted JSON:", jsonText);

  try {
    const extractedData = JSON.parse(jsonText);
    return extractedData;
  } catch (parseError) {
    console.error("[Gemini] JSON parse error:", parseError);
    console.error("[Gemini] Failed to parse:", jsonText);
    throw new Error("Failed to parse AI response as JSON");
  }
}

