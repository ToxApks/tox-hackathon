import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import 'dotenv/config';
import { GoogleGenAI, Type } from "@google/genai";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import VM from 'vm2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. Set it in .env file.");
  }
  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));
  app.use(express.raw({ type: '*/*', limit: '20mb' }));
  const upload = multer.memoryStorage();
  const uploadMiddleware = multer({ storage: upload });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post('/api/extract-topics', async (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for topic extraction.' });
    }

    try {
      const cleanText = text.slice(0, 10000);
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Extract structured learning topics from the following educational text.\nFor each topic, provide a title, a detailed explanation, 3-5 key points, and a practical example.\nText: ${cleanText}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                example: { type: Type.STRING },
              },
              required: ["title", "content", "keyPoints", "example"],
            },
          },
        },
      });
      const topics: any[] = JSON.parse(response.text || "[]");
      const formattedTopics = topics.map((t, i) => ({
        ...t,
        id: `topic-${i}`,
        order: i,
        completed: false,
      }));
      res.json(formattedTopics);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to extract topics' });
    }
  });

  app.post('/api/upload-pdf', uploadMiddleware.single('pdf'), async (req, res) => {
    try {
      let text = '';

      if (req.file) {
        const dataBuffer = req.file.buffer;
        const parser = new PDFParse({ data: dataBuffer });
        const parsed = await parser.getText();
        text = parsed.text || "";
      } else if (req.body?.text) {
        // Support JSON pre-extracted text from client PDF parsing
        text = String(req.body.text);
      } else {
        return res.status(400).json({ error: 'No PDF or text provided.' });
      }

      const titleFromBody = req.body?.title ? String(req.body.title) : (req.file?.originalname?.replace('.pdf', '') || 'upload');
      const userIdFromBody = req.body?.userId ? String(req.body.userId) : 'anonymous';

      const cleanText = text.slice(0, 10000);
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Extract structured learning topics from the following PDF text.\nFor each topic, provide title, detailed explanation, 3-5 key points, practical example.\nText: ${cleanText}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                example: { type: Type.STRING },
              },
              required: ["title", "content", "keyPoints", "example"],
            },
          },
        },
      });
      const topics: any[] = JSON.parse(response.text || "[]");
      const formattedTopics = topics.map((t, i) => ({
        ...t,
        id: `topic-${i}`,
        order: i,
        completed: false,
      }));

      const resourceData = {
        id: `resource-${Date.now()}`,
        userId: userIdFromBody,
        title: titleFromBody,
        type: 'pdf',
        uploadDate: new Date().toISOString(),
        topics: formattedTopics,
      };
      res.json(resourceData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to process PDF' });
    }
  });

  // NEW: Code execution endpoint
  app.post('/api/run-code', async (req, res) => {
    const { code, language = 'javascript', input = '' } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code is required' });
    }

    try {
      let output = '';
      let error = '';

      if (language === 'javascript') {
        const vm = new VM({
          timeout: 5000,
          sandbox: {
            console: {
              log(...args: any[]) { output += args.map(String).join(' ') + '\n'; },
              error(...args: any[]) { error += args.map(String).join(' ') + '\n'; },
            },
            input,
          },
        });

        vm.run(code);
      } else if (language === 'python') {
        try {
          // Use node-python or similar - for now spawn python process
          const { spawn } = require('child_process');
          const pyProcess = spawn('python', ['-c', code], { timeout: 5000 });
          
          let pyOutput = '';
          let pyError = '';
          
          pyProcess.stdout.on('data', (data) => pyOutput += data.toString());
          pyProcess.stderr.on('data', (data) => pyError += data.toString());
          
          pyProcess.on('close', (code) => {
            if (code === 0) {
              output = pyOutput;
            } else {
              error = pyError || 'Python execution failed';
            }
          });
        } catch (e) {
          output = 'Python requires Python installed. Check server logs.';
        }
      } else {
        return res.status(400).json({ error: 'Unsupported language' });
      }

      res.json({ output, error });
    } catch (e) {
      console.error('Code execution error:', e);
      res.status(500).json({ error: String(e) });
    }
  });

  app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `You are an AI mentor for students. Respond helpfully to: ${message}`,
      });
      res.json({ response: response.text || 'No response generated.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to generate response' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
  app.get('/dashboard', (req, res) => {
    res.redirect('http://localhost:5173/#/practice');
  });

  app.get('/playground', (req, res) => {
    res.redirect('http://localhost:5173/#/playground');
  });
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

