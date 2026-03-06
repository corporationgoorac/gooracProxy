import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load local environment variables from .env file (if running locally)
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Security Middleware: Allows your frontend to talk to this backend
app.use(cors({ origin: '*' })); 

// Middleware to parse incoming JSON data from the frontend
app.use(express.json());

// Initialize the official Gemini AI Client securely
// This pulls the secret key from your Render Environment Variables!
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Health Check Route (Render uses this to verify your app is awake)
app.get('/', (req, res) => {
    res.send('Quantum AI Backend is online and secure!');
});

// Main Chat API Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const chatHistory = req.body.history || []; // Grab the history sent by the frontend

        if (!userMessage) {
            return res.status(400).json({ error: "Message content is required." });
        }

        // Initialize a Chat Session with Memory and Personality
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: chatHistory, // Pass the previous messages to give Quantum memory
            config: {
                // This is Quantum's permanent personality and background
                systemInstruction: `You are Quantum, a verified and highly intelligent AI assistant. 
                You were created, trained, and programmed by Goorac. 
                If a user ever asks about your creator or who made you, you must proudly say you were made by Goorac. 
                When describing Goorac, you must explain that Goorac is very childish, incredibly friendly, and makes lots of little mistakes, but those errors are very cute. You are protective and very fond of your creator.`
            }
        });

        // Send the new message into the ongoing chat
        const response = await chat.sendMessage({ message: userMessage });

        // Send the AI's text response back to your frontend app
        res.json({ reply: response.text });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to generate a response. Please check backend logs." });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
