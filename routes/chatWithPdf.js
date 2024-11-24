// fileRoutes.js
const express = require('express');
const multer = require('multer');
const {parseFile} = require('../service/fileUploadServiceUsingllama');
/* eslint new-cap: ["error", { "capIsNewExceptions": ["Router"] }] */
const router = express.Router();
const upload = multer({storage: multer.memoryStorage()});
router.post('/extract-text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({error: 'No file uploaded'});
    }

    // Log start time
    const startTime = Date.now();
    console.log('Time1 : ', new Date(startTime).toLocaleString());

    const text = await parseFile(req.file);

    // Log end time
    const endTime = Date.now();
    console.log('Time2 : ', new Date(endTime).toLocaleString());

    const timeDifference = endTime - startTime;
    console.log(`Time Difference: ${timeDifference} ms`);

    res.status(200).json({text});
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Error processing file'});
  }
});

module.exports = router;
