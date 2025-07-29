import { NextRequest, NextResponse } from 'next/server';

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
      // Convert base64 audio to blob URL
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      
      // In a real implementation, you'd save this to a file server
      // For now, we'll return the base64 data
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
      text: request.body 
    });
  }
}