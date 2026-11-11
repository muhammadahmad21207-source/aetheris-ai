const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !messages.length) {
            return res.status(400).json({ error: 'Messages are required' });
        }

        const latestMessage = messages[messages.length - 1].content;
        const apiKey = process.env.GEMINI_API_KEY;

        // Direct Google Gemini REST API call (No SDK version issues)
        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: latestMessage }] }]
            })
        });

        const data = await apiResponse.json();

        if (data.candidates && data.candidates[0].content) {
            const replyText = data.candidates[0].content.parts[0].text;
            res.json({ reply: replyText });
        } else {
            console.error('API Error Response:', data);
            res.status(500).json({ error: data.error?.message || 'Failed to generate response from Gemini' });
        }
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
