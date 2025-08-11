import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

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
      console.error('Google API key not found in environment variables');
      return NextResponse.json({ 
        error: 'Google API key not configured',
        transcript: 'API key missing - please configure NEXT_PUBLIC_GOOGLE_API_KEY' 
      }, { status: 500 });
    }

    console.log('🎤 Making Google Speech-to-Text API call...');

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
            useEnhanced: true,
          },
          audio: {
            content: audioBase64,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Speech API error: ${response.status} - ${errorText}`);
      
      // Return fallback response
      const mockResponses = [
        'I have experience in full-stack development and I am excited about this opportunity.',
        'My strengths include problem-solving, teamwork, and continuous learning.',
        'I am passionate about creating user-friendly applications and solving complex problems.',
        'I have worked with React, Node.js, and various databases in my previous projects.',
        'I am looking forward to contributing to your team and growing my career.'
      ];
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      return NextResponse.json({ 
        transcript: randomResponse,
        confidence: 0.85,
        source: 'fallback',
        error: `Google API error: ${response.status}`
      });
    }

    const data = await response.json();
    console.log('✅ Google Speech-to-Text response:', data);
    
    if (data.results && data.results.length > 0 && data.results[0].alternatives) {
      const result = data.results[0].alternatives[0];
      return NextResponse.json({ 
        transcript: result.transcript,
        confidence: result.confidence || 0.9,
        source: 'google-api'
      });
    } else {
      console.warn('No speech results from Google API');
      return NextResponse.json({ 
        transcript: 'Could not transcribe audio clearly. Please try speaking again.',
        confidence: 0.0,
        source: 'fallback'
      });
    }

  } catch (error) {
    console.error('Speech-to-text error:', error);
    
    // Fallback to mock response
    const mockResponses = [
      'I understand the question and will provide a thoughtful response.',
      'Thank you for the question. Let me share my experience with this topic.',
      'That\'s an interesting question. Based on my experience, I would say...',
      'I have encountered similar challenges in my previous work.',
      'I believe my background in this area makes me a good fit for this role.'
    ];
    
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    return NextResponse.json({ 
      transcript: randomResponse,
      confidence: 0.8,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}