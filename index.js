const express = require('express');
const app = express();
const pdfRoute = require('./routes/summarize');
const chatWithPdfRoute = require('./routes/chatWithPdf');
const chatWithGeminiRoute = require('./routes/chatWithPDFGemini');
const queryWithGeminiRoute = require('./routes/queryWithGemini');


const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const dotenv = require('dotenv');
dotenv.config();


app.use('/summarize', pdfRoute);
app.use('/pdf-chat', chatWithPdfRoute);
app.use('/api', chatWithGeminiRoute);
app.use('/query', queryWithGeminiRoute);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
