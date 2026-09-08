import { GoogleGenAI } from "@google/genai";
import zlib from "node:zlib";
import path from "node:path";
import {
  AiProvider,
  DEFAULT_GEMINI_MODEL,
  DEFAULT_GROQ_MODEL,
} from "./ai-config";

let cachedPdfParser: any = null;
function getPdfParser(): any {
  if (cachedPdfParser) return cachedPdfParser;
  try {
    // Use runtime require to prevent Next.js Turbopack from statically bundling subpaths
    const dynamicRequire = eval("require");
    const cjsPath = path.join(process.cwd(), "node_modules", "pdf-parse", "dist", "cjs", "index.cjs");
    cachedPdfParser = dynamicRequire(cjsPath);
    return cachedPdfParser;
  } catch {
    try {
      const dynamicRequire = eval("require");
      cachedPdfParser = dynamicRequire("pdf-parse");
      return cachedPdfParser;
    } catch {
      return null;
    }
  }
}


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
 * Unescape PDF string literals (octal escapes, parentheses, newlines, etc.)
 */
function unescapePdfString(str: string): string {
  return str
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\\(\d{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

/**
 * Robust, high-performance byte-level scanner to extract textual content directly from raw PDF streams.
 * Handles both compressed (/FlateDecode) and uncompressed text streams without catastrophic regex backtracking.
 */
function extractTextFromPdfRawStreams(pdfBuffer: Buffer): string {
  try {
    const chunks: string[] = [];
    const streamKeyword = Buffer.from("stream");
    const endstreamKeyword = Buffer.from("endstream");

    let pos = 0;
    while (pos < pdfBuffer.length) {
      const streamIdx = pdfBuffer.indexOf(streamKeyword, pos);
      if (streamIdx === -1) break;

      let dataStart = streamIdx + streamKeyword.length;
      if (pdfBuffer[dataStart] === 0x0d && pdfBuffer[dataStart + 1] === 0x0a) {
        dataStart += 2;
      } else if (pdfBuffer[dataStart] === 0x0a || pdfBuffer[dataStart] === 0x0d) {
        dataStart += 1;
      }

      const endstreamIdx = pdfBuffer.indexOf(endstreamKeyword, dataStart);
      if (endstreamIdx === -1) break;

      let dataEnd = endstreamIdx;
      if (dataEnd > dataStart && pdfBuffer[dataEnd - 1] === 0x0a) {
        dataEnd--;
        if (dataEnd > dataStart && pdfBuffer[dataEnd - 1] === 0x0d) {
          dataEnd--;
        }
      } else if (dataEnd > dataStart && pdfBuffer[dataEnd - 1] === 0x0d) {
        dataEnd--;
      }

      if (dataEnd > dataStart) {
        const streamData = pdfBuffer.subarray(dataStart, dataEnd);
        let decompressed: Buffer | null = null;

        try {
          decompressed = zlib.inflateSync(streamData);
        } catch {
          try {
            decompressed = zlib.inflateRawSync(streamData);
          } catch {
            try {
              decompressed = zlib.unzipSync(streamData);
            } catch {
              if (
                streamData.includes(Buffer.from("BT")) ||
                streamData.includes(Buffer.from("Tj")) ||
                streamData.includes(Buffer.from("TJ"))
              ) {
                decompressed = streamData;
              }
            }
          }
        }

        if (decompressed) {
          const streamText = decompressed.toString("latin1");

          // Extract TJ kerning arrays: [(Text1) 120 (Text2)] TJ
          const tjRegex = /\[(.*?)\]\s*TJ/gs;
          let tjMatch;
          while ((tjMatch = tjRegex.exec(streamText)) !== null) {
            const inner = tjMatch[1];
            const strRegex = /\(([^]*?)\)/g;
            let sMatch;
            let combined = "";
            while ((sMatch = strRegex.exec(inner)) !== null) {
              combined += sMatch[1];
            }
            if (combined.trim()) chunks.push(unescapePdfString(combined));
          }

          // Extract single Tj strings: (Text) Tj
          const singleTjRegex = /\(([^]*?)\)\s*(?:Tj|'|")/g;
          let sMatch;
          while ((sMatch = singleTjRegex.exec(streamText)) !== null) {
            const txt = sMatch[1].trim();
            if (txt) chunks.push(unescapePdfString(txt));
          }

          // Extract hex strings: <48656C6C6F> Tj
          const hexRegex = /<([0-9A-Fa-f\s]+)>\s*(?:Tj|'|")/g;
          let hMatch;
          while ((hMatch = hexRegex.exec(streamText)) !== null) {
            const hex = hMatch[1].replace(/\s+/g, "");
            try {
              const decoded = Buffer.from(hex, "hex").toString("utf-8");
              if (decoded.trim()) chunks.push(decoded);
            } catch {
              // ignore
            }
          }
        }
      }

      pos = endstreamIdx + endstreamKeyword.length;
    }

    return chunks.join(" ").replace(/\s+/g, " ").trim();
  } catch (err) {
    console.warn("[PDF Parse] Stream extraction fallback exception:", err);
    return "";
  }
}

/**
 * Attempts to extract an embedded JPEG from a scanned PDF.
 * Scanners embed raw JPEG data directly with DCTDecode filter.
 */
function extractEmbeddedImageFromPdf(pdfBuffer: Buffer): { buffer: Buffer; mimeType: string } | null {
  try {
    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff]);
    const jpegFooter = Buffer.from([0xff, 0xd9]);

    const startIdx = pdfBuffer.indexOf(jpegHeader);
    if (startIdx !== -1) {
      const endIdx = pdfBuffer.lastIndexOf(jpegFooter);
      if (endIdx !== -1 && endIdx > startIdx) {
        const imageBuf = pdfBuffer.subarray(startIdx, endIdx + 2);
        if (imageBuf.length >= 10240 && imageBuf.length <= 4 * 1024 * 1024) {
          console.log(`[PDF Parse] Successfully extracted embedded JPEG (${(imageBuf.length / 1024).toFixed(1)} KB) from scanned PDF`);
          return { buffer: imageBuf, mimeType: "image/jpeg" };
        }
      }
    }
  } catch (err) {
    console.warn("[PDF Parse] Embedded image extraction exception:", err);
  }
  return null;
}

/**
 * Extract raw text from PDF buffer using resilient multi-tier strategies.
 */
async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  // Strategy 1: Pre-bundled CommonJS pdf-parse module
  const parser = getPdfParser();
  if (parser) {
    try {
      const parseFn =
        typeof parser === "function"
          ? parser
          : parser.pdf || parser.default;
      if (typeof parseFn === "function") {
        const res = await parseFn(new Uint8Array(pdfBuffer));
        const text = typeof res === "string" ? res : res?.text || "";
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn("[PDF Parse] CJS pdf-parse extraction failed:", err);
    }
  }

  // Strategy 2: High-performance byte stream decompression
  try {
    const streamText = extractTextFromPdfRawStreams(pdfBuffer);
    if (streamText && streamText.trim().length > 10) {
      console.log(`[PDF Parse] Extracted ${streamText.length} characters via byte stream extractor`);
      return streamText.trim();
    }
  } catch (err) {
    console.warn("[PDF Parse] Raw stream fallback failed:", err);
  }

  return "";
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
  let messages: any[] = [];

  const isVisionModel = selectedModel.includes("vision") || selectedModel.includes("qwen");
  const fallbackVisionModel = "qwen/qwen3.8-27b";

  if (isImage) {
    if (fileBuffer.length > 4 * 1024 * 1024) {
      throw new Error(
        `Image size (${(fileBuffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds Groq API payload limit. Please upload an image under 4MB, or select Google Gemini in Profile settings.`
      );
    }

    const base64Data = fileBuffer.toString("base64");
    selectedModel = isVisionModel ? selectedModel : fallbackVisionModel;

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
    if (pdfText && pdfText.trim().length > 0) {
      console.log(`[Groq] Extracted ${pdfText.length} characters of text from PDF. Passing to ${selectedModel}`);
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
    } else {
      // If PDF has no text layer (e.g. scanned image PDF)
      console.warn("[Groq] No direct text found in PDF. Attempting embedded image extraction for vision model.");

      const embeddedImg = extractEmbeddedImageFromPdf(fileBuffer);
      if (embeddedImg && embeddedImg.buffer.length <= 4 * 1024 * 1024) {
        selectedModel = isVisionModel ? selectedModel : fallbackVisionModel;
        const base64Img = embeddedImg.buffer.toString("base64");
        messages = [
          {
            role: "user",
            content: [
              { type: "text", text: INVOICE_EXTRACTION_PROMPT },
              {
                type: "image_url",
                image_url: {
                  url: `data:${embeddedImg.mimeType};base64,${base64Img}`,
                },
              },
            ],
          },
        ];
      } else {
        throw new Error(
          "Could not extract a readable text layer from this PDF invoice for Groq. Groq text models require an extractable text layer. Please switch your AI Provider to Google Gemini in Profile settings (which natively supports multimodal PDFs up to 20MB with Gemini Vision) or upload the invoice as a JPG/PNG image."
        );
      }
    }
  }

  let response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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

  // Fallback: If Groq rejected response_format: { type: "json_object" } with 400 (validation failed), retry without it
  if (!response.ok && response.status === 400) {
    console.warn("[Groq] json_object mode failed, retrying with standard completion format");
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY.trim()}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
        temperature: 0.1,
      }),
    });
  }

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
          { role: "user", content: "Ping test. Reply with the word OK." },
        ],
        max_tokens: 50,
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
