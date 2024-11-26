import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import fs from 'fs';

// Stream the response from Gemini as it's generated
export default async function handler(req, res) {
  const { prompt, pdfFilePath } = req.body;

  // Read the PDF file
  const fileData = fs.readFileSync(pdfFilePath);

  try {
    // Set up streaming of text generation
    const stream = await streamText({
      model: google('gemini-1.5-pro-latest'), // Choose appropriate model
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt, // User query
            },
            {
              type: 'file',
              data: fileData, // PDF file data
              mimeType: 'application/pdf', // Mime type for PDF
            },
          ],
        },
      ],
    });

    // Pipe the stream to the response object for real-time output
    stream.on('data', (chunk) => {
      res.write(chunk);
    });

    stream.on('end', () => {
      res.end();
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      res.status(500).json({ error: 'Streaming failed' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error processing the request' });
  }
}
