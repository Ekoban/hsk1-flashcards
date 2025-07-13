// Google Cloud Text-to-Speech API route
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Local type definitions for the API route
interface GoogleTTSRequest {
  text: string;
  voice: string;
  languageCode: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface GoogleTTSResponse {
  audioContent: string; // Base64 encoded audio
  success: boolean;
  error?: string;
  usage?: {
    characters: number;
    voice: string;
    cost: number;
  };
}

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
  // Log all incoming requests for debugging
  console.log(`🔍 Google TTS API called - Method: ${req.method}, URL: ${req.url}`);
  console.log(`📋 Request headers:`, JSON.stringify(req.headers, null, 2));
  console.log(`📦 Request body:`, req.body ? JSON.stringify(req.body, null, 2) : 'No body');

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log(`❌ Method not allowed: ${req.method}. Expected POST.`);
    return res.status(405).json({ 
      success: false, 
      error: `Method not allowed. Received ${req.method}, expected POST.` 
    });
  }

  try {
    console.log(`🎯 Processing Google TTS request...`);
    
    const { text, voice, languageCode, rate, pitch, volume }: GoogleTTSRequest = req.body;

    console.log(`📝 Request parameters:`, {
      textLength: text?.length || 0,
      textPreview: text?.substring(0, 50) || 'No text',
      voice,
      languageCode,
      rate,
      pitch,
      volume
    });

    // Validate required parameters
    if (!text) {
      console.log(`❌ Validation failed: Missing text parameter`);
      return res.status(400).json({ 
        success: false, 
        error: 'Text parameter is required' 
      });
    }

    if (!voice || !languageCode) {
      console.log(`❌ Validation failed: Missing voice (${voice}) or languageCode (${languageCode})`);
      return res.status(400).json({ 
        success: false, 
        error: 'Voice and languageCode parameters are required' 
      });
    }

    console.log(`✅ Request validation passed`);

    // Initialize TTS client
    console.log(`🔧 Initializing Google TTS client...`);
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
    console.log(`🚀 Calling Google Cloud TTS API...`);
    const [response] = await client.synthesizeSpeech(request);

    console.log(`📊 Google TTS Response:`, {
      hasAudioContent: !!response.audioContent,
      audioContentType: typeof response.audioContent,
      audioContentLength: response.audioContent?.length || 0
    });

    if (!response.audioContent) {
      console.log(`❌ No audio content received from Google TTS`);
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
    console.log(`📤 Sending response with audio length: ${response.audioContent.toString('base64').length} (base64)`);

    // Set appropriate headers for caching
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json(ttsResponse);

  } catch (error) {
    console.error('❌ Google TTS Error Details:', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : 'No stack trace',
      errorType: typeof error,
      timestamp: new Date().toISOString()
    });

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
