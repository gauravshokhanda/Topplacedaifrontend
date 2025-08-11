# Environment Variables Usage Analysis

## Current Environment Variables Found:

### 1. NEXT_PUBLIC_API_URL
**Usage Locations:**
- `next.config.js` - Line 8-11: Sets API URL based on NODE_ENV
- `app/api-test/page.tsx` - Line 13: `const API_URL = "http://localhost:3002";` (hardcoded, should use env)
- `app/learner/profile/page.tsx` - Line 29: `const API_URL = process.env.NEXT_PUBLIC_API_URL;`
- `app/learner/interview/setup/page.tsx` - Line 15: `const API_URL = process.env.NEXT_PUBLIC_API_URL;`
- `app/learner/interview/voice-session/page.tsx` - Line 25: `const API_URL = "http://localhost:3002";` (hardcoded)
- `app/learner/history/page.tsx` - Line 35: `const API_URL = process.env.NEXT_PUBLIC_API_URL;`
- `utils/api-helpers.ts` - Line 8: `const API_URL = process.env.NEXT_PUBLIC_API_URL;`

### 2. NEXT_PUBLIC_GOOGLE_API_KEY
**Usage Locations:**
- `app/api/speech-to-text/route.ts` - Line 18: Used for Google Speech-to-Text API
- `app/api/text-to-speech/route.ts` - Line 18: Used for Google Text-to-Speech API

### 3. NODE_ENV
**Usage Locations:**
- `next.config.js` - Line 9: Used to determine production vs development API URL
- `config/apiConfig.js` - Line 10: Used to select environment configuration

## Issues Found:

### 🚨 Hardcoded API URLs (Need to be replaced with env variables):
1. `app/api-test/page.tsx` - Line 13: `const API_URL = "http://localhost:3002";`
2. `app/learner/interview/voice-session/page.tsx` - Line 25: `const API_URL = "http://localhost:3002";`

### 🚨 Missing Environment Variables:
1. JWT_SECRET - For authentication
2. DATABASE_URL - For database connection
3. UPLOAD_DIR - For file uploads
4. MAX_FILE_SIZE - For file upload limits

## Recommendations:

### 1. Replace Hardcoded URLs
Replace hardcoded API URLs with environment variables in:
- `app/api-test/page.tsx`
- `app/learner/interview/voice-session/page.tsx`

### 2. Add Missing Environment Variables
Add the following to your `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=your_database_url_here
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### 3. Google API Setup
To get Google API keys:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Speech-to-Text API and Text-to-Speech API
4. Create credentials (API Key)
5. Add the API key to your `.env.local` file

### 4. Security Notes
- Never commit `.env.local` to version control
- Use different API keys for development and production
- Restrict API keys to specific APIs and domains in production