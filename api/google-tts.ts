// Google Cloud Text-to-Speech API route
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import type { GoogleTTSRequest, GoogleTTSResponse } from '../src/types/googleTTS';

// Initialize the Google Cloud TTS client
let ttsClient: TextToSpeechClient | null = null;

function initializeTTSClient() {
  if (ttsClient) return ttsClient;

  try {
    // For Vercel deployment, we'll use environment variables for authentication
    const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
      throw new Error('Missing Google Cloud credentials in environment variables');
    }

    ttsClient = new TextToSpeechClient({
      projectId,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });

    console.log('✅ Google Cloud TTS client initialized successfully');
    return ttsClient;
  } catch (error) {
    console.error('❌ Failed to initialize Google Cloud TTS client:', error);
    throw error;
  }
}

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { text, voice, languageCode, rate, pitch, volume }: GoogleTTSRequest = req.body;

    // Validate required parameters
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'Text parameter is required' 
      });
    }

    if (!voice || !languageCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'Voice and languageCode parameters are required' 
      });
    }

    // Initialize TTS client
    const client = initializeTTSClient();

    // Prepare the SSML with speed and pitch controls
    const ssml = `
      <speak>
        <prosody rate="${rate || 1.0}" pitch="${pitch || 0}">
          ${text}
        </prosody>
      </speak>
    `;

    // Configure the TTS request
    const request = {
      input: { ssml },
      voice: {
        languageCode,
        name: voice,
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        volumeGainDb: volume ? (volume - 1) * 20 : 0, // Convert 0-1 range to dB
        sampleRateHertz: 24000,
      },
    };

    console.log(`🎯 Google TTS Request: ${text.substring(0, 50)}... (${text.length} chars) with voice ${voice}`);

    // Make the TTS request
    const [response] = await client.synthesizeSpeech(request);

    if (!response.audioContent) {
      throw new Error('No audio content received from Google TTS');
    }

    // Calculate usage metrics
    const characters = text.length;
    const estimatedCost = calculateCost(voice, characters);

    // Return successful response
    const ttsResponse: GoogleTTSResponse = {
      audioContent: response.audioContent.toString('base64'),
      success: true,
      usage: {
        characters,
        voice,
        cost: estimatedCost
      }
    };

    console.log(`✅ Google TTS Success: Generated ${characters} characters of audio with ${voice}`);

    // Set appropriate headers for caching
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json(ttsResponse);

  } catch (error) {
    console.error('❌ Google TTS Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return res.status(500).json({ 
      success: false, 
      error: `Google TTS failed: ${errorMessage}`,
      audioContent: ''
    });
  }
}

// Helper function to calculate estimated cost
function calculateCost(voice: string, characters: number): number {
  const isNeural = voice.includes('Neural') || voice.includes('Wavenet');
  const costPerCharacter = isNeural ? 16 / 1000000 : 4 / 1000000; // $16 or $4 per 1M characters
  return characters * costPerCharacter;
}

// Helper function to validate voice name
function isValidVoice(voice: string): boolean {
  const validVoices = [
    'zh-CN-Standard-A', 'zh-CN-Standard-B', 'zh-CN-Standard-C', 'zh-CN-Standard-D',
    'zh-CN-Wavenet-A', 'zh-CN-Wavenet-B', 'zh-CN-Wavenet-C', 'zh-CN-Wavenet-D',
    'zh-CN-Neural2-A', 'zh-CN-Neural2-B', 'zh-CN-Neural2-C', 'zh-CN-Neural2-D'
  ];
  return validVoices.includes(voice);
}
