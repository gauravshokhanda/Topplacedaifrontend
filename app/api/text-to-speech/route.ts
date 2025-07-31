import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Google Text-to-Speech API integration
export async function POST(request: NextRequest) {
  try {
    // Parse request body safely
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' }, 
        { status: 400 }
      );
    }

    const { text, voice = 'en-US-Wavenet-F', speed = 0.9 } = requestBody;
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text parameter is required and must be a string' }, 
        { status: 400 }
      );
    }

    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    if (!googleApiKey) {
      console.error('Google API key not found in environment variables');
      return NextResponse.json({ 
        audioUrl: null,
        useBrowserTTS: true,
        text,
        error: 'Google API key not configured'
      }, { status: 500 });
    }

    console.log('🔊 Making Google Text-to-Speech API call for text:', text.substring(0, 50) + '...');

    try {
      // Google Text-to-Speech API call
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode: 'en-US',
              name: voice,
              ssmlGender: 'FEMALE',
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: speed,
              pitch: 0,
              volumeGainDb: 0,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Google TTS API error: ${response.status} - ${errorText}`);
        throw new Error(`Google TTS API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Google Text-to-Speech API successful');
      
      if (data.audioContent) {
        // Return the base64 audio data
        return NextResponse.json({ 
          audioContent: data.audioContent,
          audioUrl: `data:audio/mp3;base64,${data.audioContent}`,
          text,
          useBrowserTTS: false,
          source: 'google-api'
        });
      } else {
        throw new Error('No audio content received from Google TTS');
      }

    } catch (apiError) {
      console.error('Google TTS API error:', apiError);
      
      // Fallback to browser speech synthesis
      return NextResponse.json({ 
        audioUrl: null,
        useBrowserTTS: true,
        text,
        source: 'browser-fallback',
        error: apiError instanceof Error ? apiError.message : 'Google TTS unavailable'
      });
    }

  } catch (error) {
    console.error('Text-to-speech route error:', error);
    
    // Return a safe fallback response
    return NextResponse.json(
      { 
        error: 'Internal server error',
        audioUrl: null,
        useBrowserTTS: true,
        text: requestBody?.text || 'Error occurred',
        source: 'error-fallback'
      }, 
      { status: 500 }
    );
  }
}