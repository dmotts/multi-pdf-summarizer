# PDF Analysis Backend API

This backend API allows users to upload  multiple PDF files, which are then analyzed to generate detailed bullet points for each page. Using Google Generative AI's Gemini model, the API provides insights into each page's key facts, figures, and concepts.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [Error Handling](#error-handling)
- [License](#license)

## Overview
This API backend leverages Express, Multer for file handling, and Google’s Generative AI API to analyze PDF files. It uses a round-robin approach for API keys to handle requests efficiently and includes error handling for file types, file size, and other potential issues.

## Features
- PDF file upload with a 10MB size limit.
- Bullet-point analysis of each PDF page using the Gemini AI model.
- Error handling for unsupported file types and size restrictions.
- Round-robin API key usage for managing multiple Google Generative AI API keys.

## Tech Stack
- **Backend Framework**: Express.js
- **File Handling**: Multer
- **AI Model**: Google Generative AI (Gemini Model)
- **Environment Management**: dotenv
- **Cross-Origin Resource Sharing**: CORS


## Environment Variables
Create a `.env` file in the root directory and add the following variables:
```plaintext
PORT=8000
GEMINI_API_KEY_1=your_first_gemini_api_key
GEMINI_API_KEY_2=your_second_gemini_api_key
GEMINI_API_KEY_3=your_third_gemini_api_key
```

## API Endpoints

### 1. Analyze PDF
- **Endpoint**: `POST /summarize/analyze-pdf`
- **Description**: Accepts a PDF file and returns a bullet-point analysis for each page.
- **Headers**:
  - `Content-Type: multipart/form-data`
- **Body**:
  - `file` (required): The PDF file to be analyzed. Only files up to 10MB are allowed.
- **Response**:
  - **Success**:
     - **Status**: 200
     - **Body**:
        ```json
        {
          "success": true,
          "analysis": "Detailed bullet points for each page",
          "metadata": {
             "filename": "uploaded_file_name.pdf",
             "filesize": 1048576,
             "timestamp": "2024-11-15T12:00:00.000Z"
          }
        }
        ```
  - **Error**:
     - **Status**: 400 or 500
     - **Body**:
        ```json
        {
          "error": "Error message explaining the issue"
        }
        ```

**Example Request**: Use Postman or cURL to send a POST request with a PDF file:
```bash
curl -X POST -F "file=@/path/to/file.pdf" http://localhost:8000/summarize/analyze-pdf
```

## Usage
1. Start the server:
    ```bash
    npm start
    ```
2. Make a POST request to `/summarize/analyze-pdf` with a PDF file attached.

## Error Handling
- **File Type Restriction**: Only PDF files are allowed. Returns a 400 error for unsupported file types.
- **File Size Restriction**: Files larger than 10MB will return a 400 error.
- **API Errors**: If analysis fails, a 500 error with details will be returned.
