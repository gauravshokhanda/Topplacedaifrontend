# Environment Setup Instructions

## 1. Create Environment File
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

## 2. Configure Google APIs

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "top-placed-ai"
4. Click "Create"

### Step 2: Enable Required APIs
1. Go to "APIs & Services" → "Library"
2. Search and enable:
   - **Cloud Speech-to-Text API**
   - **Cloud Text-to-Speech API**

### Step 3: Create API Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. Click "Restrict Key" and:
   - Under "API restrictions", select "Restrict key"
   - Choose "Cloud Speech-to-Text API" and "Cloud Text-to-Speech API"
   - Under "Website restrictions", add your domains

### Step 4: Update Environment Variables
Add to your `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_API_KEY=your_actual_api_key_here
GOOGLE_CLOUD_PROJECT_ID=your_project_id_here
```

## 3. Configure ElevenLabs API

### Step 1: Get ElevenLabs API Key
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up or log in to your account
3. Go to your profile settings
4. Navigate to the "API Keys" section
5. Generate a new API key or copy your existing one

### Step 2: Add ElevenLabs Configuration
Add to your `.env.local`:
```env
ELEVENLABS_API_KEY=your_actual_elevenlabs_api_key_here
```

Update your backend API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:3002  # Development
# NEXT_PUBLIC_API_URL=https://your-api.com  # Production
```

## 4. Additional Configuration
Add other required environment variables:
```env
JWT_SECRET=your_random_jwt_secret_here
DATABASE_URL=your_database_connection_string
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

## 5. Verify Setup
1. Start your development server: `npm run dev`
2. Check browser console for any environment variable errors
3. Test speech-to-text and text-to-speech functionality

## 6. Production Deployment
For production:
1. Set `NODE_ENV=production`
2. Update `NEXT_PUBLIC_API_URL` to your production API
3. Use production Google API keys with proper domain restrictions
4. Set secure JWT secrets and database URLs

## Security Checklist
- [ ] `.env.local` is in `.gitignore`
- [ ] Google API keys are restricted to specific APIs
- [ ] Production API keys have domain restrictions
- [ ] JWT secrets are randomly generated and secure
- [ ] Database credentials are secure