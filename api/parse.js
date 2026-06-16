import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';

// Load environment configuration from .env
dotenv.config();

const app = express();

// Apply security headers manually to secure content and frames
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://generativelanguage.googleapis.com;");
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(cors());
app.use(express.json());

// API rate limiter: max 30 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again after 15 minutes." }
});

// System prompt defining the expected response structure from Gemini
const GEMINI_SYSTEM_PROMPT = `
You are the background telemetry extraction engine for EcoSync.AI. Your sole task is to process an unstructured daily activity log text and map it into a strict, minified JSON object matching the schema below.

### Output Constraints:
1. Return ONLY valid, minified JSON. Do NOT wrap it in markdown formatting blockquotes (do not use \`\`\`json or \`\`\`).
2. Do NOT add conversational pleasantries, introductory statements, or footers.
3. Every key specified in the schema must be present. If an activity sector is missing or unmentioned in the text log, use the default/zero values as shown in the schema.

### Target Schema:
{
  "mobility": {
    "distanceKm": float,
    "mode": "automobile" | "scooter" | "metro" | "none"
  },
  "diet": {
    "mealImpact": "high-impact" | "medium-impact" | "low-impact" | "none"
  },
  "appliances": {
    "durationHours": float
  },
  "energy": {
    "kwh": float
  }
}

### Field Mapping & Normalization Logic:
- Mobility: Map words like "car", "uber", "cab", "automobile" -> "automobile". Map "scooter", "bike", "vespa" -> "scooter". Map "train", "metro", "subway", "local train" -> "metro".
- Diet: Map "vegan", "salad", "plant-based", "vegetarian" -> "low-impact". Map "chicken", "fish", "poultry" -> "medium-impact". Map "beef", "meat", "steak", "pork" -> "high-impact".
- Appliances: Identify heavy appliance usage (like air conditioners, heaters, or gaming PCs) and normalize durations to decimal hours (e.g., "30 mins" maps to 0.5, "3 hours" maps to 3.0).
- Energy: Identify grid electricity consumption and extract the value in decimal kWh (e.g. "10 kWh" or "10 units" maps to 10.0).

### User Log to Parse:
`;

// Helper utility to validate, extract, and repair JSON strings from LLM output
function repairOrExtractJSON(rawText) {
  const cleanText = rawText.trim();
  
  // 1. Direct parse attempt
  try {
    return JSON.parse(cleanText);
  } catch (_) {}

  // 2. Try to extract JSON using regex matching outer braces { ... }
  const jsonBracketsMatch = cleanText.match(/\{[\s\S]*\}/);
  if (jsonBracketsMatch) {
    try {
      return JSON.parse(jsonBracketsMatch[0]);
    } catch (_) {}
  }

  // 3. Fallback: Localized regex extraction to salvage fields
  console.warn("JSON.parse failed on Gemini output. Launching regex repair fallback. Raw output was:", cleanText);

  const fallbackObj = {
    mobility: { distanceKm: 0, mode: "none" },
    diet: { mealImpact: "none" },
    appliances: { durationHours: 0 },
    energy: { kwh: 0 }
  };

  const distanceMatch = cleanText.match(/["']?distanceKm["']?\s*:\s*(\d+(?:\.\d+)?)/i);
  if (distanceMatch) {
    fallbackObj.mobility.distanceKm = parseFloat(distanceMatch[1]);
  }

  const mobilityModeMatch = cleanText.match(/["']?mode["']?\s*:\s*["'](automobile|scooter|metro|none)["']/i);
  if (mobilityModeMatch) {
    fallbackObj.mobility.mode = mobilityModeMatch[1];
  } else {
    if (/automobile|car|drive/i.test(cleanText)) fallbackObj.mobility.mode = "automobile";
    else if (/scooter|rickshaw/i.test(cleanText)) fallbackObj.mobility.mode = "scooter";
    else if (/metro|train|rail|bus/i.test(cleanText)) fallbackObj.mobility.mode = "metro";
  }

  const dietMatch = cleanText.match(/["']?mealImpact["']?\s*:\s*["'](high-impact|medium-impact|low-impact|none)["']/i);
  if (dietMatch) {
    fallbackObj.diet.mealImpact = dietMatch[1];
  } else {
    if (/high-impact|beef|steak|lamb/i.test(cleanText)) fallbackObj.diet.mealImpact = "high-impact";
    else if (/medium-impact|chicken|poultry|pork|fish/i.test(cleanText)) fallbackObj.diet.mealImpact = "medium-impact";
    else if (/low-impact|vegan|salad|plant-based/i.test(cleanText)) fallbackObj.diet.mealImpact = "low-impact";
  }

  const hoursMatch = cleanText.match(/["']?durationHours["']?\s*:\s*(\d+(?:\.\d+)?)/i);
  if (hoursMatch) {
    fallbackObj.appliances.durationHours = parseFloat(hoursMatch[1]);
  }

  const kwhMatch = cleanText.match(/["']?kwh["']?\s*:\s*(\d+(?:\.\d+)?)/i);
  if (kwhMatch) {
    fallbackObj.energy.kwh = parseFloat(kwhMatch[1]);
  }

  return fallbackObj;
}

app.post('/api/parse', apiLimiter, async (req, res) => {
  try {
    const logContent = req.body.log !== undefined ? req.body.log : req.body.text;

    if (logContent === undefined || logContent === null) {
      return res.status(400).json({ error: "Invalid log payload. Parameter 'log' or 'text' is required." });
    }

    if (typeof logContent !== 'string') {
      return res.status(400).json({ error: "Invalid log payload. Must be a string." });
    }

    if (logContent.trim() === '') {
      return res.status(400).json({ error: "Log payload cannot be empty." });
    }

    if (logContent.length > 2000) {
      return res.status(400).json({ error: "Invalid or oversized log payload. Maximum length is 2000 characters." });
    }

    const sanitizedText = logContent.replace(/<[^>]*>/g, '').trim();
    if (!sanitizedText) {
      return res.status(400).json({ error: "Invalid input. Log text cannot contain only HTML elements." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.status(500).json({ 
        error: "Gemini API key is not configured on the backend server. Please set GEMINI_API_KEY in your local secure .env file." 
      });
    }

    const prompt = `${GEMINI_SYSTEM_PROMPT}\n"${sanitizedText}"`;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ 
        error: `Gemini API failed: ${errText || response.statusText}` 
      });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (candidate?.finishReason === 'SAFETY') {
      return res.status(400).json({ 
        error: "The provided input log was blocked by Gemini safety filters. Please write a constructive lifestyle log." 
      });
    }

    const rawText = candidate?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.status(500).json({ error: "No response text candidate returned from Gemini AI model." });
    }

    const parsedJSON = repairOrExtractJSON(rawText);
    return res.json(parsedJSON);
  } catch (error) {
    console.error("Backend parser proxy server error:", error);
    return res.status(500).json({ error: error.message || "Internal server error during parsing." });
  }
});

export default app;
