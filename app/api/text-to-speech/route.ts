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

    const { text } = requestBody;
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text parameter is required and must be a string' }, 
        { status: 400 }
      );
    }

    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    if (!googleApiKey) {
      console.warn('Google API key not found, using browser speech synthesis');
      return NextResponse.json({ 
        audioUrl: null,
        useBrowserTTS: true,
        text 
      });
    }

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
              name: 'en-US-Wavenet-F', // Female voice
              ssmlGender: 'FEMALE',
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: 0.9,
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
      
      if (data.audioContent) {
        // Return the base64 audio data
        return NextResponse.json({ 
          audioContent: data.audioContent,
          audioUrl: `data:audio/mp3;base64,${data.audioContent}`,
          text,
          useBrowserTTS: false
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
        error: 'Google TTS unavailable, using browser fallback'
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
        text: 'Error occurred'
      }, 
      { status: 500 }
    );
  }
}