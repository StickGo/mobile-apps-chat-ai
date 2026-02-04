import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/chat', async (req, res) => {
  const { message, history, customPrompt, image, mimeType } = req.body;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured in .env');
    }

    // Stable Flash model (Requested: gemini-2.5-flash)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: customPrompt || `
        You are Vanguard Core, a premium, high-intelligence AI developed by Nexus. 
        Your responses must be:
        1. Sophisticated and Precise: Use expert-level language but remain clear.
        2. Aesthetically Structured: Use clean markdown, bullet points, and proper spacing.
        3. Efficient: Avoid unnecessary filler words.
        4. Problem-Solver: You can answer anything across all disciplines (Universal).
        
        Formatting Rule: Always use bold text for key terms and separate sections with blank lines.
      `.trim()
    });

    let chatHistory = (history || []).map((msg: any) => ({
      role: (msg.role === 'user' ? 'user' : 'model') as 'user' | 'model',
      parts: [{ text: msg.content as string }],
    }));

    // Find the first 'user' message to start the history correctly
    const firstUserIndex = chatHistory.findIndex((m: any) => m.role === 'user');
    if (firstUserIndex !== -1) {
      chatHistory = chatHistory.slice(firstUserIndex);
    } else {
      chatHistory = [];
    }

    const chat = model.startChat({
      history: chatHistory,
    });

    // Content for the current message
    const userParts: any[] = [{ text: message }];
    
    if (image && mimeType) {
      userParts.push({
        inlineData: {
          mimeType: mimeType,
          data: image
        }
      });
    }

    const result = await chat.sendMessageStream(userParts);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }

    res.end();
  } catch (error: any) {
    console.error('Chat Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal Server Error',
        details: error.toString()
      });
    }
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', engine: 'Vanguard Core' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Vanguard Core Backend listening at http://0.0.0.0:${port}`);
});
