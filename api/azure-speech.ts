// API route for Azure Speech Service
// This would typically be in pages/api/azure-speech.ts for Next.js
// or as a serverless function for Vercel

interface AzureSpeechRequest {
  text: string;
  rate: number;
  voice: string;
  lang: string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, rate, voice, lang }: AzureSpeechRequest = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // Azure Speech Service configuration
  const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
  const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

  if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
    return res.status(500).json({ error: 'Azure Speech Service not configured' });
  }

  try {
    // Create SSML for better pronunciation control
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">
        <voice name="${voice}">
          <prosody rate="${rate}">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    // Call Azure Speech Service
    const response = await fetch(
      `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          'User-Agent': 'HSK-Flashcards'
        },
        body: ssml
      }
    );

    if (!response.ok) {
      throw new Error(`Azure API error: ${response.status}`);
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer();
    
    // Set appropriate headers for audio
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    
    // Return the audio data
    res.send(Buffer.from(audioBuffer));
    
  } catch (error) {
    console.error('Azure Speech error:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
