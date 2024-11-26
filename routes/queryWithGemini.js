const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
/* eslint new-cap: ["error", { "capIsNewExceptions": ["Router"] }] */
const router = express.Router();

const apiKey = process.env.GEMINI_API_KEY_1;

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

router.post('/chat-with-pdf', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!req.body.query) {
    return res.status(400).json({ error: 'No query provided' });
  }

  let extractedContent = '';
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const base64Data = req.file.buffer.toString('base64');

    const result = await model.generateContent({
      contents: [{
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data,
            },
          },
          {
            text: req.body.query, // Query from frontend
          },
        ],
      }],
    });

    extractedContent = result.response.text();

    res.json({
      success: true,
      response: extractedContent,
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({
      error: 'Failed to process PDF and query',
      details: error.message,
    });
  }
});

module.exports = router;
