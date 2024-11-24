const {ocr} = require('llama-ocr');
const mammoth = require('mammoth');
const pdfToPng = require('pdf-to-png-converter').pdfToPng;
// const pdfParser = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const parseFile = async (file) => {
  console.log('parseFile function called');
  const {originalname} = file;
  const fileType = getFileType(originalname);
  let text = '';

  console.log(`File type determined: ${fileType}`);

  if (fileType === 'docx') {
    console.log('Calling extractTextFromDocx');
    text = await extractTextFromDocx(file);
  } else if (fileType === 'pdf') {
    text = await extractTextFromScannedPdf(file);
    // console.log('Checking if PDF is text-searchable');
    // const isTextSearchable = await checkIfTextSearchable(file);
    // if (isTextSearchable) {
    //   console.log('PDF is searchable, calling extractTextFromPdf');
    //   text = await extractTextFromPdf(file);
    // } else {
    //   console.log('PDF is not searchable, calling extractTextFromScannedPdf');
    //   text = await extractTextFromScannedPdf(file);
    // }
  } else {
    throw new Error('Unsupported file type: ' + fileType);
  }

  return text;
};

const getFileType = (filePath) => {
  const extension = filePath.split('.').pop().toLowerCase();
  if (extension === 'docx') {
    return 'docx';
  } else if (extension === 'pdf') {
    return 'pdf';
  } else {
    return 'unknown';
  }
};

const extractTextFromDocx = async (file) => {
  console.log('Extracting text from docx');
  const {value} = await mammoth.extractRawText(file.buffer);
  return value;
};

// const extractTextFromPdf = async (file) => {
//   console.log('Extracting text from PDF');
//   const data = await pdfParser(file.buffer);
//   return data.text;
// };

const extractTextFromScannedPdf = async (file) => {
  console.log('Extracting text from non-searchable (scanned) PDF');

  const convertPdfToImg = async (buffer) => {
    const pngPages = await pdfToPng(buffer, {
      disableFontFace: false,
      useSystemFonts: false,
      viewportScale: 2.0,
    });
    return pngPages;
  };

  const pages = await convertPdfToImg(file.buffer);
  let text = '';

  for (let i = 0; i < pages.length; i++) {
    console.log(`Saving image for page ${i + 1}`);

    const imageFilePath = path.join(__dirname, `temp_page_${i + 1}.png`);
    fs.writeFileSync(imageFilePath, pages[i].content);

    console.log(`Running OCR on page ${i + 1}`);

    const imageText = await ocr({
      filePath: imageFilePath,
      apiKey: 'c407f8c08f30ed82724a190ec5835940910cff7686d7f6c50822f8ffc9395d0b', // Use your actual API key here
    });

    text += imageText + '\n';

    fs.unlinkSync(imageFilePath);
  }

  return text;
};


// const checkIfTextSearchable = async (file) => {
//   const data = await pdfParser(file.buffer);
//   console.log('Checking if PDF has searchable text');
//   return data.numpages > 0 && data.text.replaceAll('\n', '').length > 0;
// };


module.exports = {parseFile};
