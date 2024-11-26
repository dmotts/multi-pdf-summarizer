const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
/* eslint new-cap: ["error", { "capIsNewExceptions": ["Router"] }] */
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

const apiKey = process.env.GEMINI_API_KEY_1;


let extractedContent = '';
let pdfUploaded = false; 


router.post('/analyze-pdf', upload.single('file'), handleMulterError, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

 extractedContent=' ';

  try {
    console.log('File:', req.file);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const base64Data = req.file.buffer.toString('base64');

    console.log('Request time:', new Date().toLocaleString());
    const result = await model.generateContent({
      contents: [{
        parts: [
          { 
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data
            }
          },
          {
            text: 'Extract the text from this PDF.'
          }
        ]
      }]
    });


    extractedContent = result.response.text(); 
    pdfUploaded = true;

    console.log('Response received time:', new Date().toLocaleString());
    console.log('PDF content:', extractedContent);

    res.json({
      success: true,
      initialSummary: extractedContent,
      metadata: {
        filename: req.file.originalname,
        filesize: req.file.size,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('PDF Analysis Error:', error);
    res.status(500).json({
      error: 'Failed to analyze PDF',
      details: error.message,
      fullError: error
    });
  }
});

router.post('/chat-with-pdf', async (req, res) => {
  if (!pdfUploaded) {
    return res.status(400).json({ error: 'No PDF has been uploaded yet. Please upload a PDF first.' });
  }

  if (!req.body || !req.body.query) {
    return res.status(400).json({ error: 'No query provided' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const userQuery = req.body.query;

    // Corrected prompt format for Gemini API
    const result = await model.generateContent({
      contents: [{
        parts: [
          { text: extractedContent },
          { text: userQuery }
        ]
      }]
    });

    console.log('User query:', userQuery, 'Request time:', new Date().toLocaleString());
    const responseText = result.response.text(); 

    console.log('Response received time:', new Date().toLocaleString());

    res.json({
      success: true,
      response: responseText,
      query: userQuery,
    });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({
      error: 'Failed to chat with PDF content',
      details: error.message,
      fullError: error
    });
  }
});




module.exports = router;