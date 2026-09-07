import { GoogleGenAI } from "@google/genai";
import {
  AiProvider,
  DEFAULT_GEMINI_MODEL,
  DEFAULT_GROQ_MODEL,
} from "./ai-config";

export const INVOICE_EXTRACTION_PROMPT = `You are an expert invoice data extraction specialist. Analyze this invoice document (PDF, image, or text) and extract ALL visible information with high accuracy. Return ONLY a valid JSON object in the exact format below. Be very precise with numbers, dates, and text.

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
  "currency": "Currency code (INR, USD, EUR, GBP, etc., if multiple currencies used, return the primary one detected)"
}

IMPORTANT: 
- Extract ALL line items from the invoice
- Use exact numbers and text as shown
- If a field is not found or empty, use null
- Return ONLY the raw JSON object, no introductory or concluding markdown or text
- Ensure all numbers (prices, quantities, subtotals, totals) are parsed accurately as numbers`;

export interface ExtractInvoiceOptions {
  fileBuffer: Buffer;
  mimeType: string;
  provider?: AiProvider;
  apiKey?: string;
  model?: string;
}

/**
 * Robust JSON parser that handles markdown fences, embedded snippets, and formatting anomalies.
 */
function cleanAndParseJson(text: string, provider: string): any {
  let jsonText = text.trim();

  // Strip markdown code fences
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
  } else if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  // Find outermost JSON object
  const firstBrace = jsonText.indexOf("{");
  const lastBrace = jsonText.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonText = jsonText.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(jsonText);
  } catch (parseError) {
    console.error(`[${provider}] JSON parse error:`, parseError);
    console.error(`[${provider}] Raw text attempted:`, jsonText);
    throw new Error(`Failed to parse AI response from ${provider} as valid JSON`);
  }
}

/**
 * Extract raw text from PDF buffer using pdf-parse.
 */
async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as any).default || pdfParseModule;
    const data = await pdfParse(pdfBuffer);
    return data?.text?.trim() || "";
  } catch (err) {
    console.warn("[PDF Parse] Could not extract text directly from PDF buffer:", err);
    return "";
  }
}

/**
 * Extract invoice data using Google Gemini API
 */
async function extractWithGemini(
  fileBuffer: Buffer,
  mimeType: string,
  apiKey?: string,
  model?: string
): Promise<any> {
  const GEMINI_API_KEY = apiKey || process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured. Please add your Gemini API key in Profile settings.");
  }

  const selectedModel = model || process.env.GEMINI_AI_MODEL || DEFAULT_GEMINI_MODEL;
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
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
      { text: INVOICE_EXTRACTION_PROMPT },
    ],
  });

  let text = "";
  if (typeof result.text === "string") {
    text = result.text;
  } else {
    text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  return cleanAndParseJson(text, `Gemini (${selectedModel})`);
}

/**
 * Extract invoice data using Groq Cloud API
 */
async function extractWithGroq(
  fileBuffer: Buffer,
  mimeType: string,
  apiKey?: string,
  model?: string
): Promise<any> {
  const GROQ_API_KEY = apiKey || process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key is not configured. Please add your Groq API key in Profile settings.");
  }

  let selectedModel = model || process.env.GROQ_AI_MODEL || DEFAULT_GROQ_MODEL;
  const isImage = mimeType.startsWith("image/");
  const base64Data = fileBuffer.toString("base64");

  let messages: any[] = [];

  if (isImage) {
    // If it's an image, use a vision model if available or fallback to llama-3.2-11b-vision-preview
    const isVisionModel = selectedModel.includes("vision");
    const visionModelToUse = isVisionModel ? selectedModel : "llama-3.2-11b-vision-preview";

    selectedModel = visionModelToUse;
    messages = [
      {
        role: "user",
        content: [
          { type: "text", text: INVOICE_EXTRACTION_PROMPT },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`,
            },
          },
        ],
      },
    ];
  } else {
    // For PDFs, extract text and send to Groq model
    const pdfText = await extractTextFromPdf(fileBuffer);
    if (!pdfText) {
      // If PDF has no text layer (e.g. scanned PDF), try vision model if supported
      console.warn("[Groq] No direct text found in PDF. Attempting extraction with vision model.");
      selectedModel = "llama-3.2-11b-vision-preview";
      messages = [
        {
          role: "user",
          content: [
            { type: "text", text: INVOICE_EXTRACTION_PROMPT },
            {
              type: "image_url",
              image_url: {
                url: `data:application/pdf;base64,${base64Data}`,
              },
            },
          ],
        },
      ];
    } else {
      messages = [
        {
          role: "system",
          content: "You are an expert invoice data extraction specialist. Extract all visible information and return only a JSON object.",
        },
        {
          role: "user",
          content: `${INVOICE_EXTRACTION_PROMPT}\n\n--- INVOICE DOCUMENT EXTRACTED TEXT ---\n${pdfText}`,
        },
      ];
    }
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY.trim()}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let parsedErr = errorBody;
    try {
      const j = JSON.parse(errorBody);
      parsedErr = j.error?.message || errorBody;
    } catch {
      // keep raw error
    }
    throw new Error(`Groq API Error (${response.status}): ${parsedErr}`);
  }

  const responseData = await response.json();
  const rawContent = responseData.choices?.[0]?.message?.content || "";

  return cleanAndParseJson(rawContent, `Groq (${selectedModel})`);
}

/**
 * Universal invoice extraction function supporting both Gemini and Groq.
 * Backwards compatible with existing (fileBuffer, mimeType, apiKey) call signature.
 */
export async function extractInvoiceData(
  optionsOrBuffer: Buffer | ExtractInvoiceOptions,
  legacyMimeType?: string,
  legacyApiKey?: string,
  legacyModel?: string,
  legacyProvider?: AiProvider
): Promise<any> {
  let fileBuffer: Buffer;
  let mimeType: string;
  let provider: AiProvider = "gemini";
  let apiKey: string | undefined;
  let model: string | undefined;

  if (Buffer.isBuffer(optionsOrBuffer)) {
    fileBuffer = optionsOrBuffer;
    mimeType = legacyMimeType || "application/pdf";
    apiKey = legacyApiKey;
    model = legacyModel;
    provider = legacyProvider || "gemini";
  } else {
    fileBuffer = optionsOrBuffer.fileBuffer;
    mimeType = optionsOrBuffer.mimeType;
    provider = optionsOrBuffer.provider || "gemini";
    apiKey = optionsOrBuffer.apiKey;
    model = optionsOrBuffer.model;
  }

  if (provider === "groq") {
    return extractWithGroq(fileBuffer, mimeType, apiKey, model);
  }

  return extractWithGemini(fileBuffer, mimeType, apiKey, model);
}

/**
 * Test connectivity and authentication for a chosen AI provider and model.
 */
export async function testAiConnection({
  provider,
  apiKey,
  model,
}: {
  provider: AiProvider;
  apiKey: string;
  model?: string;
}): Promise<{ success: boolean; message: string; latencyMs: number; model: string }> {
  const startTime = Date.now();

  if (!apiKey || !apiKey.trim()) {
    throw new Error("API key is required to perform connectivity test");
  }

  const cleanKey = apiKey.trim();

  if (provider === "gemini") {
    const selectedModel = model || DEFAULT_GEMINI_MODEL;
    const ai = new GoogleGenAI({ apiKey: cleanKey });
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: "Reply with the word 'OK' in JSON format: {\"status\": \"OK\"}",
    });

    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      message: `Connected to Google Gemini successfully (${selectedModel})`,
      latencyMs,
      model: selectedModel,
    };
  }

  if (provider === "groq") {
    const selectedModel = model || DEFAULT_GROQ_MODEL;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cleanKey}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "user", content: "Reply with the word 'OK' in JSON format: {\"status\": \"OK\"}" },
        ],
        response_format: { type: "json_object" },
        max_tokens: 30,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let msg = errText;
      try {
        const j = JSON.parse(errText);
        msg = j.error?.message || errText;
      } catch {
        // keep raw
      }
      throw new Error(`Groq validation failed (${response.status}): ${msg}`);
    }

    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      message: `Connected to Groq Cloud successfully (${selectedModel})`,
      latencyMs,
      model: selectedModel,
    };
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}
