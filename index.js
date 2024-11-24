const express = require('express');
const app = express();
const pdfRoute = require('./routes/summarize');
const chatWithPdfRoute = require('./routes/chatWithPdf');


const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const dotenv = require('dotenv');
dotenv.config();


app.use('/summarize', pdfRoute);
app.use('/pdf-chat', chatWithPdfRoute);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
