import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// ElevenLabs Text-to-Speech API integration
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

    const { text, voice_id = 'EXAVITQu4vr4xnSDxMaL', model_id = 'eleven_monolingual_v1' } = requestBody;
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text parameter is required and must be a string' }, 
        { status: 400 }
      );
    }

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!elevenLabsApiKey) {
      console.error('ElevenLabs API key not found in environment variables');
      return NextResponse.json({ 
        audioUrl: null,
        useBrowserTTS: true,
        text,
        error: 'ElevenLabs API key not configured'
      }, { status: 500 });
    }

    console.log('🔊 Making ElevenLabs Text-to-Speech API call for text:', text.substring(0, 50) + '...');

    try {
      // ElevenLabs Text-to-Speech API call
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsApiKey,
          },
          body: JSON.stringify({
            text,
            model_id,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
              style: 0.0,
              use_speaker_boost: true
            }
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs API error: ${response.status} - ${errorText}`);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      // Get audio data as array buffer
      const audioBuffer = await response.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');
      
      console.log('✅ ElevenLabs Text-to-Speech API successful');
      
      return NextResponse.json({ 
        audioContent: audioBase64,
        audioUrl: `data:audio/mpeg;base64,${audioBase64}`,
        text,
        useBrowserTTS: false,
        source: 'elevenlabs-api'
      });

    } catch (apiError) {
      console.error('ElevenLabs API error:', apiError);
      
      // Fallback to browser speech synthesis
      return NextResponse.json({ 
        audioUrl: null,
        useBrowserTTS: true,
        text,
        source: 'browser-fallback',
        error: apiError instanceof Error ? apiError.message : 'ElevenLabs API unavailable'
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