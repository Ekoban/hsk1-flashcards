# 🎯 Google Cloud Text-to-Speech Migration Strategy

## 📋 Executive Summary

This document outlines the comprehensive strategy for migrating from the current Web Speech API (with disabled Azure components) to Google Cloud Text-to-Speech API. The migration will also include complete removal of all Azure-related code and infrastructure.

## 🔍 Current State Analysis

### Current Audio Architecture
- **Primary**: Web Speech API (`useSpeechSynthesis.ts`)
- **Disabled**: Azure Speech Service (exists but disabled)
- **Components**: AudioButton, AzureUsageStats, AdminDashboard
- **Tracking**: AudioUsageTracker with Azure/WebSpeech stats

### Current Audio Flow
```
AudioButton → useSpeechSynthesis → Browser SpeechSynthesis API → Audio Output
```

### Azure Components to Remove
1. **API Routes**: `api/azure-speech.ts`
2. **Hooks**: `src/hooks/useAzureSpeech.ts`
3. **Components**: `src/components/AzureUsageStats.tsx`
4. **Services**: Azure-related functions in `audioUsageTracker.ts`
5. **Admin Dashboard**: Azure stats sections
6. **Documentation**: Azure references in markdown files

## 🎯 Target Architecture: Google Cloud TTS

### Why Google Cloud TTS?
- **Superior Quality**: Neural voices with natural pronunciation
- **Generous Free Tier**: 1M characters/month for Standard voices, 100K for Neural
- **Chinese Language Support**: Excellent Mandarin voices (zh-CN, zh-TW)
- **Consistent Performance**: Server-side generation, predictable results
- **Cost Effective**: Much cheaper than Azure for Chinese TTS

### New Audio Flow
```
AudioButton → useGoogleTTS → /api/google-tts → Google Cloud TTS API → Audio Stream → Audio Output
```

## 📁 File Structure Changes

### Files to Create
```
src/
├── hooks/
│   └── useGoogleTTS.ts                 # New Google TTS hook
├── services/
│   └── googleTTSUsageTracker.ts        # Google TTS usage tracking
├── components/
│   └── GoogleTTSStats.tsx              # Usage stats component
└── types/
    └── googleTTS.ts                    # TypeScript interfaces

api/
└── google-tts.ts                       # Google Cloud TTS API endpoint
```

### Files to Modify
```
src/
├── components/
│   ├── AudioButton.tsx                 # Switch to Google TTS
│   ├── AdminDashboard.tsx              # Remove Azure, add Google stats
│   └── HSK1FlashcardApp.tsx           # Update audio settings
├── services/
│   └── audioUsageTracker.ts            # Remove Azure tracking
└── hooks/
    └── useSpeechSynthesis.ts           # Remove or deprecate
```

### Files to Delete
```
src/
├── hooks/
│   └── useAzureSpeech.ts               # Delete entirely
└── components/
    └── AzureUsageStats.tsx             # Delete entirely

api/
└── azure-speech.ts                     # Delete entirely
```

## 🔧 Implementation Plan

### Phase 1: Google Cloud TTS Setup (Environment & API)
1. **Google Cloud Project Setup**
   - Create/configure Google Cloud project
   - Enable Text-to-Speech API
   - Generate service account key
   - Set up environment variables

2. **Environment Variables**
   ```bash
   # Add to .env.local
   GOOGLE_CLOUD_PROJECT_ID=your_project_id
   GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   GOOGLE_CLOUD_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
   ```

3. **Install Dependencies**
   ```bash
   npm install @google-cloud/text-to-speech
   ```

### Phase 2: Core Google TTS Implementation
1. **Create API Route** (`api/google-tts.ts`)
   - Handle POST requests with text/voice parameters
   - Authenticate with Google Cloud
   - Generate audio using TTS API
   - Return audio stream/blob
   - Implement error handling and usage tracking

2. **Create Google TTS Hook** (`src/hooks/useGoogleTTS.ts`)
   - Manage TTS state (loading, error, playing)
   - Handle audio generation and playback
   - Implement usage tracking
   - Provide fallback to Web Speech API if needed

3. **Create Usage Tracker** (`src/services/googleTTSUsageTracker.ts`)
   - Track monthly/daily character usage
   - Monitor API calls and errors
   - Store statistics in localStorage
   - Provide usage analytics for admin dashboard

### Phase 3: Azure Removal
1. **Remove Azure Files**
   - Delete `src/hooks/useAzureSpeech.ts`
   - Delete `src/components/AzureUsageStats.tsx`
   - Delete `api/azure-speech.ts`

2. **Clean AudioUsageTracker**
   - Remove all Azure-related methods
   - Remove Azure usage tracking
   - Simplify interface to focus on Google TTS + Web Speech fallback

3. **Update Admin Dashboard**
   - Remove Azure statistics sections
   - Add Google TTS usage statistics
   - Update audio service status indicators

### Phase 4: Component Integration
1. **Update AudioButton**
   - Replace `useSpeechSynthesis` with `useGoogleTTS`
   - Implement Google TTS as primary method
   - Keep Web Speech API as fallback
   - Add loading states for API calls

2. **Update Settings UI**
   - Add Google TTS voice selection
   - Add quality/speed controls specific to Google TTS
   - Update audio service status display

3. **Create Google TTS Stats Component**
   - Display usage metrics (daily/monthly)
   - Show remaining quota
   - Indicate service status

### Phase 5: Testing & Optimization
1. **Audio Quality Testing**
   - Test Chinese pronunciation accuracy
   - Compare voice options (Standard vs Neural)
   - Validate speed/pitch controls

2. **Performance Testing**
   - Test API response times
   - Implement audio caching if needed
   - Monitor usage patterns

3. **Error Handling**
   - Test quota exceeded scenarios
   - Test network failure fallbacks
   - Validate Web Speech API fallback

## 🛠️ Technical Implementation Details

### Google TTS Voice Options
```typescript
interface GoogleTTSVoice {
  name: string;
  languageCode: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  voiceType: 'STANDARD' | 'NEURAL' | 'WAVENET';
}

// Recommended Chinese voices:
const chineseVoices: GoogleTTSVoice[] = [
  { name: 'zh-CN-Wavenet-A', languageCode: 'zh-CN', ssmlGender: 'FEMALE', voiceType: 'WAVENET' },
  { name: 'zh-CN-Wavenet-B', languageCode: 'zh-CN', ssmlGender: 'MALE', voiceType: 'WAVENET' },
  { name: 'zh-CN-Neural2-A', languageCode: 'zh-CN', ssmlGender: 'FEMALE', voiceType: 'NEURAL' },
  { name: 'zh-CN-Neural2-B', languageCode: 'zh-CN', ssmlGender: 'MALE', voiceType: 'NEURAL' }
];
```

### Audio Settings Enhancement
```typescript
interface AudioSettings {
  enabled: boolean;
  autoPlay: boolean;
  speed: number;
  voice: string;           // Google TTS voice name
  quality: 'standard' | 'neural' | 'wavenet';
  fallbackToWebSpeech: boolean;
}
```

### Usage Tracking Schema
```typescript
interface GoogleTTSUsage {
  monthlyCharacters: number;
  dailyCharacters: number;
  monthlyAPICalls: number;
  dailyAPICalls: number;
  lastResetDate: string;
  preferredVoice: string;
  totalCost: number;       // Estimated cost tracking
}
```

## 💰 Cost Analysis

### Google Cloud TTS Pricing (2025)
- **Standard Voices**: $4.00 per 1M characters
- **WaveNet Voices**: $16.00 per 1M characters  
- **Neural2 Voices**: $16.00 per 1M characters
- **Free Tier**: 1M characters/month (Standard), 100K (Neural/WaveNet)

### Estimated Usage for HSK Flashcards
- **Average Chinese word**: 1.5 characters
- **Daily active users**: 100 users
- **Words per session**: 50 words
- **Sessions per user/day**: 2

**Monthly estimate**: 100 × 50 × 1.5 × 2 × 30 = 450K characters/month
**Cost**: $0 (within free tier for Standard voices)

## 🚀 Migration Benefits

### Quality Improvements
- **Consistent Pronunciation**: Server-side generation
- **Natural Voices**: Neural/WaveNet quality
- **Reliable Performance**: No browser compatibility issues
- **Advanced Controls**: SSML support for fine-tuning

### Technical Benefits
- **Simplified Architecture**: Remove complex Azure fallback logic
- **Better Error Handling**: Centralized API error management
- **Usage Analytics**: Detailed tracking and cost monitoring
- **Scalability**: Google Cloud's robust infrastructure

### User Experience
- **Faster Audio Loading**: Cached responses
- **Better Voice Options**: Multiple high-quality Chinese voices
- **Consistent Quality**: Same experience across all devices
- **Offline Fallback**: Web Speech API backup

## 📋 Testing Checklist

### Pre-Migration Testing
- [ ] Current Web Speech API functionality working
- [ ] Admin dashboard shows correct audio stats
- [ ] All Azure components properly disabled

### Google TTS Testing
- [ ] API authentication working
- [ ] Audio generation successful for Chinese text
- [ ] Voice selection options working
- [ ] Speed/pitch controls functional
- [ ] Usage tracking accurate
- [ ] Error handling robust

### Integration Testing
- [ ] AudioButton uses Google TTS successfully
- [ ] Fallback to Web Speech API when needed
- [ ] Admin dashboard shows Google TTS stats
- [ ] Settings UI controls Google TTS options

### Performance Testing
- [ ] Audio loading times acceptable (<2 seconds)
- [ ] Concurrent user load testing
- [ ] Usage quota monitoring working
- [ ] Cost tracking accurate

## 🎯 Success Metrics

### Quality Metrics
- **Audio Quality**: User feedback on pronunciation clarity
- **Reliability**: 99%+ successful audio generation
- **Performance**: <2 second average response time

### Usage Metrics
- **API Efficiency**: Stay within free tier limits
- **User Engagement**: Maintained or improved audio usage
- **Error Rates**: <1% API failures

### Technical Metrics
- **Code Simplicity**: Reduced Azure-related complexity
- **Maintainability**: Clean, documented Google TTS integration
- **Performance**: No regressions in app loading or responsiveness

## 📅 Timeline Estimate

- **Phase 1 (Setup)**: 1-2 days
- **Phase 2 (Core Implementation)**: 2-3 days  
- **Phase 3 (Azure Removal)**: 1 day
- **Phase 4 (Integration)**: 2-3 days
- **Phase 5 (Testing)**: 2-3 days

**Total**: 8-12 days

## 🔄 Rollback Plan

If migration encounters issues:
1. **Immediate**: Keep Web Speech API as working fallback
2. **Partial Rollback**: Disable Google TTS, use Web Speech only
3. **Full Rollback**: Restore Azure components if absolutely necessary

The Web Speech API will remain functional throughout migration as a safety net.

---

## ✅ Ready to Proceed

This strategy provides a comprehensive roadmap for migrating to Google Cloud Text-to-Speech while completely removing Azure dependencies. The approach prioritizes:

1. **Zero Downtime**: Web Speech API remains functional during migration
2. **Quality Improvement**: Superior Chinese pronunciation with Google TTS
3. **Cost Efficiency**: Stay within free tier limits
4. **Code Simplification**: Remove complex Azure integration
5. **Future Scalability**: Google Cloud infrastructure ready for growth

The migration will result in a more reliable, higher-quality audio experience for HSK flashcard learners while simplifying the codebase and reducing maintenance overhead.
