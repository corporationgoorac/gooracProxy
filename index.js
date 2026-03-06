import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load local environment variables (ignored in production on Render)
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Security Middleware: Allows your frontend to talk to this backend
// Note: For strict production, replace '*' with your frontend's actual URL
app.use(cors({ origin: '*' })); 

// Middleware to parse incoming JSON data from the frontend
app.use(express.json());

// Initialize the official Gemini AI Client
// It automatically detects the 'GEMINI_API_KEY' environment variable
const ai = new GoogleGenAI({});

// Health Check Route (Render uses this to verify your app is awake)
app.get('/', (req, res) => {
    res.send('Goorac Quantum Backend is online and secure!');
});

// Main Chat API Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;

        // Ensure the frontend actually sent a message
        if (!userMessage) {
            return res.status(400).json({ error: "Message content is required." });
        }

        // Securely call the Gemini 2.5 Flash-Lite model
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: userMessage,
        });

        // Send the AI's text response back to your frontend app
        res.json({ reply: response.text });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to generate a response. Please try again later." });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
