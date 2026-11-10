const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !messages.length) {
            return res.status(400).json({ error: 'Messages are required' });
        }

        // Use the stable gemini-2.5-flash or gemini-1.5-flash model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Format history for the SDK
        const chatHistory = messages.slice(0, -1).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const latestMessage = messages[messages.length - 1].content;

        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(latestMessage);
        const responseText = await result.response.text();

        res.json({ reply: responseText });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
