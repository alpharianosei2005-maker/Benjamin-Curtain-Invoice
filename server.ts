import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

// Body parser for JSON with higher limit for base64 images
app.use(express.json({ limit: '15mb' }));

// Lazy Gemini AI Client Initialization
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Photo / Paper Invoice Scan Route
app.post('/api/scan-invoice', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required' });
    }

    const ai = getAiClient();
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `Analyze this paper invoice, handwritten receipt, or order note for a curtain & interior decor business.
Extract all details into JSON with the following structure:
{
  "customerName": "string or empty if unknown",
  "customerPhone": "string or empty if unknown",
  "invoiceNumber": "string or empty",
  "date": "YYYY-MM-DD format if visible, or null",
  "items": [
    {
      "description": "Item name (e.g. Curtains, Voile, Rail, Tie Hook, Tie Back, L-Shape, Pinch Tape, Pinch Hook, Curtain Hook, Sewing, Blind, etc.)",
      "quantity": number,
      "price": number
    }
  ]
}

Ensure quantity and price are numbers (e.g. 232, 85, 23.8). Do not wrap inside Markdown code blocks. Return strictly valid JSON only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/jpeg',
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const resultText = response.text || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(resultText);
    } catch (e) {
      console.error('Failed to parse Gemini JSON output:', resultText);
      return res.status(500).json({ error: 'Failed to structure scanned invoice content' });
    }

    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Scan invoice error:', error);
    res.status(500).json({ error: error.message || 'Failed to scan image' });
  }
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
