// Google Cloud Text-to-Speech Test API route
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');

module.exports = async function handler(req: any, res: any) {
  // Allow GET and POST for testing
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use GET or POST.' 
    });
  }

  console.log('🔍 Google TTS Test - Starting diagnostic...');

  try {
    // Phase 1: Check environment variables
    console.log('🔍 Phase 1: Environment Variables Check');
    const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

    const envCheck = {
      privateKey: privateKey ? `Present (${privateKey.length} chars)` : 'MISSING',
      clientEmail: clientEmail ? `Present (${clientEmail})` : 'MISSING',
      projectId: projectId ? `Present (${projectId})` : 'MISSING',
      hasValidKey: privateKey && privateKey.includes('-----BEGIN PRIVATE KEY-----'),
      hasValidEmail: clientEmail && clientEmail.includes('@'),
    };

    console.log('📋 Environment Check Results:', envCheck);

    // Phase 2: Initialize Google TTS Client
    console.log('🔍 Phase 2: Google TTS Client Initialization');
    let client: any = null;
    let clientError: string | null = null;

    try {
      if (!privateKey || !clientEmail || !projectId) {
        throw new Error('Missing required environment variables');
      }

      client = new TextToSpeechClient({
        projectId,
        credentials: {
          client_email: clientEmail,
          private_key: privateKey,
        },
      });

      console.log('✅ Google TTS Client initialized successfully');
    } catch (error) {
      clientError = error instanceof Error ? error.message : 'Unknown client initialization error';
      console.error('❌ Client initialization failed:', clientError);
    }

    // Phase 3: Test basic TTS functionality (only if client initialized)
    let ttsTest: any = null;
    if (client && req.method === 'POST') {
      console.log('🔍 Phase 3: Testing TTS Synthesis');
      
      try {
        const testText = req.body?.text || '你好世界';
        const testVoice = req.body?.voice || 'zh-CN-Standard-A';
        const testLanguageCode = req.body?.languageCode || 'zh-CN';

        console.log(`🎯 Testing with: "${testText}" using voice ${testVoice}`);

        const request = {
          input: { text: testText },
          voice: {
            languageCode: testLanguageCode,
            name: testVoice,
          },
          audioConfig: {
            audioEncoding: 'MP3' as const,
            sampleRateHertz: 24000,
          },
        };

        const [response] = await client.synthesizeSpeech(request);

        if (response.audioContent) {
          ttsTest = {
            success: true,
            audioLength: response.audioContent.length,
            audioType: typeof response.audioContent,
            testText,
            testVoice,
            audioBase64Length: response.audioContent.toString('base64').length,
          };
          console.log('✅ TTS synthesis successful:', ttsTest);
        } else {
          throw new Error('No audio content received');
        }

      } catch (error) {
        ttsTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown TTS error',
        };
        console.error('❌ TTS synthesis failed:', ttsTest);
      }
    }

    // Phase 4: Environment diagnostics
    console.log('🔍 Phase 4: Environment Diagnostics');
    const diagnostics = {
      nodeVersion: process.version,
      platform: process.platform,
      currentTime: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_REGION: process.env.VERCEL_REGION,
      }
    };

    console.log('📊 Environment Diagnostics:', diagnostics);

    // Comprehensive response
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      method: req.method,
      phases: {
        environmentCheck: envCheck,
        clientInitialization: {
          success: client !== null,
          error: clientError,
        },
        ttsTest: ttsTest,
        diagnostics: diagnostics,
      },
      summary: {
        allGood: client !== null && (req.method === 'GET' || (ttsTest && ttsTest.success)),
        readyForProduction: client !== null && !clientError,
      }
    };

    console.log('🏁 Google TTS Test Complete:', response.summary);

    return res.status(200).json(response);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('💥 Google TTS Test Failed:', errorMessage);

    return res.status(500).json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
}
