const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public')); // Serve the HTML file

let chatHistory = [];

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    chatHistory.push({ role: "user", content: userMessage });

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: chatHistory
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const aiReply = response.data.choices[0].message.content;
        chatHistory.push({ role: "assistant", content: aiReply });

        // Limit chat history to last 10 messages to manage token usage
        if (chatHistory.length > 10) {
            chatHistory = chatHistory.slice(-10);
        }

        res.json({ reply: aiReply });
    } catch (error) {
        console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
        res.status(500).json({ reply: "Sorry, there was an error processing your request." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
