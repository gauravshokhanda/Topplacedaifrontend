import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

  const {
    text,
    voice_id = 'pNInz6obpgDQGcFmaJgB', // Custom voice (female)
    model_id = 'eleven_multilingual_v2', // Supports multiple languages
  } = requestBody;

  if (!text || typeof text !== 'string') {
    return NextResponse.json(
      { error: 'Text parameter is required and must be a string' },
      { status: 400 }
    );
  }

  const elevenLabsApiKey = "sk_c3283be99f92ab217ba4ad94108760f006ff5a9cb6560834";
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

  if (!elevenLabsApiKey) {
    console.error('ElevenLabs API key not found');
    return NextResponse.json(
      {
        audioUrl: null,
        useBrowserTTS: true,
        text,
        error: 'ElevenLabs API key not configured',
      },
      { status: 500 }
    );
  }

  console.log(`🔊 TTS request: ${text.slice(0, 60)}...`);

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.7,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ ElevenLabs API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        {
          audioUrl: null,
          useBrowserTTS: true,
          text,
          source: 'browser-fallback',
          error: `ElevenLabs API error: ${response.status}`,
        },
        { status: 500 }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    console.log('✅ ElevenLabs TTS success');

    return NextResponse.json({
      audioContent: audioBase64,
      audioUrl: `data:audio/mpeg;base64,${audioBase64}`,
      text,
      useBrowserTTS: false,
      source: 'elevenlabs-api',
    });
  } catch (error) {
    console.error('❌ ElevenLabs fetch error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        audioUrl: null,
        useBrowserTTS: true,
        text,
        source: 'fallback-error',
      },
      { status: 500 }
    );
  }
}
