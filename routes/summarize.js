const express = require('express');
const multer = require('multer');
const {GoogleGenerativeAI} = require('@google/generative-ai');
/* eslint new-cap: ["error", { "capIsNewExceptions": ["Router"] }] */
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {fileSize: 10 * 1024 * 1024}, // 10MB limit
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({error: 'File size exceeds 10MB limit'});
    }
    return res.status(400).json({error: err.message});
  } else if (err) {
    return res.status(400).json({error: err.message});
  }
  next();
};

const api_key1=process.env.GEMINI_API_KEY_1;
const api_key2=process.env.GEMINI_API_KEY_2;
const api_key3=process.env.GEMINI_API_KEY_3;

const geminiApiKeys = [
    api_key1,
    api_key2,
    api_key3,
];

// Round-robin selection of API keys
let apiKeyIndex = 0;
const getApiKey = () => {
  const apiKey = geminiApiKeys[apiKeyIndex];
  apiKeyIndex = (apiKeyIndex + 1) % geminiApiKeys.length;
  return apiKey;
};

router.post('/analyze-pdf', upload.single('file'), handleMulterError, async (req, res) => {
  try {
    console.log('File:', req.file); // Log the file

    const apiKey = getApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({model: 'gemini-1.5-pro'});
    const base64Data = req.file.buffer.toString('base64');

    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `
                For each individual page of this PDF:
                - Create detailed bullet points listing every key fact, figure, and concept.
                - Number each page's bullets clearly (e.g., "Page 1:", "Page 2:").
                - Include all specific data points, numbers, and statistics.
                - Note any tables, graphs, or visual elements, and provide key information.
    
                Requirements:
                - Use only factual information; avoid interpretations or summaries.
                - Maintain consistent bullet-point formatting throughout.
                - Include page numbers for reference in the output.
                - Preserve all numerical data, dates, and specific details.
                - Note any missing or unreadable pages explicitly.
                - Maintain context without hallucinations. Perform this analysis for all pages in the PDF document.
              `,
            },
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: base64Data,
              },
            },
          ],
        },
      ],
    };

    console.log(req.file.originalname, 'API key index:', apiKeyIndex, 'Request time:', new Date().toLocaleString());
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log(req.file.originalname, 'Response received time:', new Date().toLocaleString());
    
    res.json({
      success: true,
      analysis: responseText,
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
    });
  }
});

module.exports = router;
