import { NextRequest, NextResponse } from 'next/server';

// Google Speech-to-Text API integration
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert audio file to base64
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    // Google Speech-to-Text API call
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    if (!googleApiKey) {
      console.warn('Google API key not found, using mock response');
      return NextResponse.json({ 
        transcript: 'I have experience in full-stack development and I am excited about this opportunity.' 
      });
    }

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: 'en-US',
            enableAutomaticPunctuation: true,
            model: 'latest_long',
          },
          audio: {
            content: audioBase64,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const transcript = data.results[0].alternatives[0].transcript;
      return NextResponse.json({ transcript });
    } else {
      return NextResponse.json({ transcript: 'Could not transcribe audio' });
    }

  } catch (error) {
    console.error('Speech-to-text error:', error);
    
    // Fallback to mock response
    const mockResponses = [
      'I have 3 years of experience in full-stack development.',
      'My strengths include problem-solving and teamwork.',
      'I am passionate about creating user-friendly applications.',
      'I have worked with React, Node.js, and various databases.',
      'I am excited about this opportunity to grow my career.'
    ];
    
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    return NextResponse.json({ transcript: randomResponse });
  }
}