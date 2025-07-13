// Quick test script for Google TTS API debugging
// Usage: node test-google-tts.js

const PRODUCTION_URL = 'https://hsk1-flashcards.vercel.app'; // Update this if different

async function testGoogleTTSAPI() {
    console.log('🔍 Testing Google TTS API...\n');

    const testCases = [
        {
            name: 'Environment Test (GET)',
            url: `${PRODUCTION_URL}/api/google-tts-test`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        },
        {
            name: 'TTS Synthesis Test (POST)',
            url: `${PRODUCTION_URL}/api/google-tts-test`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: '你好世界',
                voice: 'zh-CN-Standard-A',
                languageCode: 'zh-CN'
            })
        },
        {
            name: 'Production API Test (POST)',
            url: `${PRODUCTION_URL}/api/google-tts`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: '测试',
                voice: 'zh-CN-Standard-A',
                languageCode: 'zh-CN',
                rate: 1.0,
                pitch: 0,
                volume: 1.0
            })
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n🧪 Running: ${testCase.name}`);
        console.log(`📡 ${testCase.method} ${testCase.url}`);

        try {
            const options = {
                method: testCase.method,
                headers: testCase.headers
            };

            if (testCase.body) {
                options.body = testCase.body;
            }

            const response = await fetch(testCase.url, options);
            const data = await response.json();

            console.log(`📊 Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                console.log(`✅ Success:`, JSON.stringify(data, null, 2));
            } else {
                console.log(`❌ Error:`, JSON.stringify(data, null, 2));
            }

        } catch (error) {
            console.log(`💥 Network Error:`, error.message);
        }
        
        console.log(`${'='.repeat(60)}`);
    }
}

// Test if we're in Node.js environment
if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ with fetch support');
    console.log('💡 Try: npx node@18 test-google-tts.js');
    process.exit(1);
}

testGoogleTTSAPI().catch(console.error);
