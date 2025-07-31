import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Google Text-to-Speech API integration
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
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
      throw new Error(`Google TTS API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.audioContent) {
      // Return the base64 audio data
      return NextResponse.json({ 
        audioContent: data.audioContent,
        audioUrl: `data:audio/mp3;base64,${data.audioContent}`,
        text 
      });
    } else {
      throw new Error('No audio content received');
    }

  } catch (error) {
    console.error('Text-to-speech error:', error);
    
    // Fallback to browser speech synthesis
    return NextResponse.json({ 
      audioUrl: null,
      useBrowserTTS: true,
      text: (await request.json()).text
    });
  }
}