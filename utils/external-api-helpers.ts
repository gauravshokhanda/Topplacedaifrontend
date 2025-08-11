// External API Helper Functions - Using External Services Only
// This replaces internal backend calls with direct external API calls

import config from '@/config/apiConfig';

// OpenAI API Helper
export async function callOpenAI(messages: any[], model: string = 'gpt-3.5-turbo') {
  const response = await fetch(`${config.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    })
  });
  
  return await response.json();
}

// Google Speech-to-Text API
export async function speechToText(audioBlob: Blob) {
  const audioBuffer = await audioBlob.arrayBuffer();
  const audioBase64 = Buffer.from(audioBuffer).toString('base64');
  
  const response = await fetch(
    `${config.googleApiUrl}/speech:recognize?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`,
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
        },
        audio: {
          content: audioBase64,
        },
      }),
    }
  );
  
  return await response.json();
}

// Google Text-to-Speech API
export async function textToSpeech(text: string) {
  const response = await fetch(
    `${config.googleApiUrl}/text:synthesize?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Wavenet-D',
          ssmlGender: 'NEUTRAL',
        },
        audioConfig: {
          audioEncoding: 'MP3',
        },
      }),
    }
  );
  
  return await response.json();
}

// ElevenLabs Text-to-Speech API
export async function elevenlabsTextToSpeech(text: string, voiceId: string = 'pNInz6obpgDQGcFmaJgB') {
  const response = await fetch(
    `${config.elevenlabsApiUrl}/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    }
  );
  
  return response;
}

// Interview Session Management (Local Storage Based)
export class InterviewSession {
  private sessionId: string;
  private conversationHistory: any[] = [];
  
  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.loadFromStorage();
  }
  
  private loadFromStorage() {
    const stored = localStorage.getItem(`interview_${this.sessionId}`);
    if (stored) {
      const data = JSON.parse(stored);
      this.conversationHistory = data.conversationHistory || [];
    }
  }
  
  private saveToStorage() {
    localStorage.setItem(`interview_${this.sessionId}`, JSON.stringify({
      sessionId: this.sessionId,
      conversationHistory: this.conversationHistory,
      timestamp: new Date().toISOString(),
    }));
  }
  
  async sendMessage(message: string, type: 'user' | 'ai' = 'user') {
    const messageObj = {
      id: `msg_${Date.now()}`,
      type,
      content: message,
      timestamp: new Date().toISOString(),
    };
    
    this.conversationHistory.push(messageObj);
    this.saveToStorage();
    
    if (type === 'user') {
      // Get AI response using OpenAI
      const aiResponse = await this.getAIResponse(message);
      return aiResponse;
    }
    
    return messageObj;
  }
  
  private async getAIResponse(userMessage: string) {
    const messages = [
      {
        role: 'system',
        content: 'You are an AI interviewer conducting a technical interview. Ask relevant questions based on the conversation history and provide constructive feedback.'
      },
      ...this.conversationHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];
    
    try {
      const response = await callOpenAI(messages);
      const aiMessage = response.choices[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.';
      
      const aiMessageObj = {
        id: `msg_${Date.now()}`,
        type: 'ai' as const,
        content: aiMessage,
        timestamp: new Date().toISOString(),
      };
      
      this.conversationHistory.push(aiMessageObj);
      this.saveToStorage();
      
      return aiMessageObj;
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: `msg_${Date.now()}`,
        type: 'ai' as const,
        content: 'I apologize, but I encountered a technical issue. Please check your API configuration and try again.',
        timestamp: new Date().toISOString(),
      };
      
      this.conversationHistory.push(errorMessage);
      this.saveToStorage();
      
      return errorMessage;
    }
  }
  
  getSessionId() {
    return this.sessionId;
  }
  
  getConversationHistory() {
    return this.conversationHistory;
  }
  
  endSession() {
    // Save final session data
    this.saveToStorage();
    return {
      sessionId: this.sessionId,
      conversationHistory: this.conversationHistory,
      endTime: new Date().toISOString(),
      totalMessages: this.conversationHistory.length,
    };
  }
}

// Code Execution (Mock - since we can't execute code without backend)
export async function executeCode(code: string, language: string) {
  // This is a mock implementation since we can't execute code without a backend
  // In a real scenario, you'd need a code execution service
  return {
    success: true,
    output: `// Code execution is not available without backend\n// Submitted ${language} code:\n${code}\n\n// Note: To execute code, you need a backend service or use external code execution APIs`,
    executionTime: 0,
    memoryUsed: '0KB',
    error: null,
  };
}