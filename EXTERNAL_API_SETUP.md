# External API Setup Guide

This guide explains how to use external APIs instead of the internal backend for the TopPlaced AI application.

## Overview

The application has been configured to use external APIs directly instead of relying on the internal backend. This approach provides:

- **Independence**: No need to run the backend server
- **Direct Integration**: Direct calls to OpenAI, Google, and ElevenLabs APIs
- **Simplified Architecture**: Frontend-only solution for API interactions

## Configuration

### 1. Environment Variables

Update your `.env.local` file with the following external API configurations:

```env
# API Configuration - External APIs Only
NEXT_PUBLIC_EXTERNAL_API_URL=https://api.openai.com/v1
NODE_ENV=development

# External API Keys
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### 2. API Keys Setup

#### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Add it to your `.env.local` as `NEXT_PUBLIC_OPENAI_API_KEY`

#### Google API Key
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Speech-to-Text and Text-to-Speech APIs
4. Create credentials (API Key)
5. Add it to your `.env.local` as `NEXT_PUBLIC_GOOGLE_API_KEY`

#### ElevenLabs API Key
1. Visit [ElevenLabs](https://elevenlabs.io/)
2. Create an account
3. Go to your profile settings
4. Copy your API key
5. Add it to your `.env.local` as `ELEVENLABS_API_KEY`

## Usage

### 1. External API Helpers

Use the new external API helpers instead of internal backend calls:

```typescript
import { 
  callOpenAI, 
  speechToText, 
  textToSpeech, 
  elevenlabsTextToSpeech, 
  InterviewSession,
  executeCode 
} from '@/utils/external-api-helpers';

// Example: OpenAI Chat
const response = await callOpenAI([
  { role: 'user', content: 'Hello!' }
]);

// Example: Interview Session
const session = new InterviewSession();
const aiResponse = await session.sendMessage('Tell me about yourself');
```

### 2. Interview Session Management

The `InterviewSession` class provides:
- Local storage-based session management
- Conversation history tracking
- AI responses via OpenAI API
- Session persistence

```typescript
const session = new InterviewSession();

// Send user message and get AI response
const aiResponse = await session.sendMessage('I have 3 years of React experience');

// Get conversation history
const history = session.getConversationHistory();

// End session
const sessionData = session.endSession();
```

### 3. Text-to-Speech

Two options available:

```typescript
// Google Text-to-Speech
const googleAudio = await textToSpeech('Hello world');

// ElevenLabs Text-to-Speech (higher quality)
const elevenlabsAudio = await elevenlabsTextToSpeech('Hello world');
```

### 4. Speech-to-Text

```typescript
// Convert audio blob to text
const transcript = await speechToText(audioBlob);
```

## Demo Page

Visit `/external-api-demo` to test all external API integrations:

- OpenAI chat completions
- Google Text-to-Speech
- ElevenLabs Text-to-Speech
- Interview session management
- Code execution (mock)

## Migration from Internal Backend

### Before (Internal Backend)
```typescript
const response = await fetch(`${API_URL}/interview/start`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(payload)
});
```

### After (External APIs)
```typescript
const session = new InterviewSession();
const response = await session.sendMessage(userMessage);
```

## Benefits

1. **No Backend Dependency**: Frontend can work independently
2. **Direct API Access**: Faster responses, no middleware
3. **Cost Effective**: Pay only for API usage, no server costs
4. **Scalable**: APIs handle scaling automatically
5. **Reliable**: Use proven external services

## Limitations

1. **API Keys Exposure**: Frontend API keys are visible (use environment variables)
2. **No Code Execution**: Real code execution requires backend service
3. **No Database**: Session data stored in localStorage only
4. **CORS Limitations**: Some APIs may have CORS restrictions

## Security Considerations

1. **API Key Management**: 
   - Use environment variables
   - Rotate keys regularly
   - Monitor usage

2. **Rate Limiting**:
   - Implement client-side rate limiting
   - Monitor API usage
   - Set usage alerts

3. **Data Privacy**:
   - Be aware of data sent to external APIs
   - Review API providers' privacy policies
   - Consider data encryption

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Check if key is correctly set in `.env.local`
   - Restart development server
   - Verify key permissions

2. **CORS Errors**
   - Some APIs may require server-side calls
   - Consider using Next.js API routes as proxy

3. **Rate Limiting**
   - Implement delays between requests
   - Cache responses when possible
   - Monitor API usage

### Debug Mode

Enable debug logging by adding to `.env.local`:
```env
NEXT_PUBLIC_DEBUG_API=true
```

## Next Steps

1. Test all APIs using the demo page
2. Update existing components to use external API helpers
3. Implement proper error handling
4. Add rate limiting and caching
5. Monitor API usage and costs

## Support

For issues or questions:
1. Check the demo page for working examples
2. Review API provider documentation
3. Check browser console for errors
4. Verify environment variable configuration