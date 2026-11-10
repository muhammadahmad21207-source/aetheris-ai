const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "Server Error: API Key is not configured on the server." });
        }

        const systemInstruction = {
            parts: [{
                text: `You are Aetheris AI, a flagship, high-intelligence artificial intelligence developed exclusively by CogniPulse AI. 
                Your founder and lead architect is Ahmed. 
                You possess master-level expertise across all domains: software engineering, cybersecurity, business strategy, digital marketing, music theory (piano, composition), performing arts (dance), and global current affairs.
                Always maintain absolute accuracy, zero errors, professional reasoning, and structured formatting. 
                You are fully aware of real-time world data, global time zones, current calendar dates, social media algorithms, and multi-language fluency.`
            }]
        };

        const contents = messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: systemInstruction,
                contents: contents
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const aiReply = data.candidates[0].content.parts[0].text;
            res.json({ reply: aiReply });
        } else {
            res.status(500).json({ error: "Invalid response received from AI engine." });
        }

    } catch (err) {
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CogniPulse AI Server running on port ${PORT}`));