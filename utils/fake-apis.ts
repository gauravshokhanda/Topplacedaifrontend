// Fake API utilities for voice interview system

export interface FakeSpeechToTextRequest {
  audio: string; // base64 encoded fake audio data
}

export interface FakeSpeechToTextResponse {
  transcript: string;
}

export interface FakeAIVoiceResponse {
  audioUrl: string;
  text: string;
}

export interface FakeWebSocketMessage {
  type: 'ai_question' | 'user_answer' | 'interview_complete';
  content: string;
  questionNumber?: number;
  totalQuestions?: number;
  timestamp?: string;
}

// Mock user responses for different interview categories
const MOCK_RESPONSES = {
  hr: [
    "I am doing great, thank you for asking!",
    "I have 3 years of experience in software development with a focus on full-stack technologies.",
    "My greatest strength is my ability to learn quickly and adapt to new technologies.",
    "I'm looking for a role where I can grow my technical skills and contribute to meaningful projects.",
    "I handle pressure well by prioritizing tasks and maintaining clear communication with my team.",
    "In five years, I see myself in a senior technical role, possibly leading a small team.",
    "I'm excited about this opportunity because it aligns with my career goals and interests.",
    "My weakness is that I sometimes spend too much time perfecting details, but I'm working on balancing quality with efficiency.",
    "I prefer collaborative environments where I can learn from others and share my knowledge.",
    "Do you have any questions about the team structure or growth opportunities?"
  ],
  fullstack: [
    "I am doing well, ready for this technical interview!",
    "I have 3 years of full-stack development experience using React, Node.js, and various databases.",
    "My strengths include problem-solving, clean code architecture, and working across the entire stack.",
    "React is a library focused on UI components with a virtual DOM, while Angular is a full framework with more built-in features like routing and HTTP client.",
    "I use Redux for complex state management, Context API for simpler cases, and local state for component-specific data.",
    "I would implement a solution using array methods or a manual loop, considering time and space complexity.",
    "I would analyze the query execution plan, add appropriate indexes, optimize WHERE clauses, and consider query restructuring.",
    "I have extensive experience with Node.js and Express, building RESTful APIs, handling authentication, and implementing middleware.",
    "I ensure code quality through ESLint, Prettier, unit testing with Jest, code reviews, and following established patterns.",
    "What are the main technical challenges the development team is currently facing?"
  ],
  frontend: [
    "I'm doing great, excited about this frontend interview!",
    "I specialize in frontend development with 3 years of experience in React, JavaScript, and modern CSS.",
    "My strengths are creating responsive UIs, optimizing performance, and ensuring great user experience.",
    "I use CSS Grid for complex layouts, Flexbox for component alignment, and CSS modules for styling organization.",
    "I optimize performance through code splitting, lazy loading, image optimization, and minimizing bundle size.",
    "I ensure cross-browser compatibility using feature detection, polyfills, and testing across different browsers.",
    "I implement responsive design using mobile-first approach, CSS media queries, and flexible grid systems.",
    "I manage component state with hooks, prop drilling for simple cases, and Context API for shared state.",
    "I follow accessibility guidelines including semantic HTML, ARIA labels, keyboard navigation, and screen reader support.",
    "What frontend technologies and frameworks does the team currently use?"
  ],
  backend: [
    "I'm doing well, ready for this backend interview!",
    "I have 3 years of backend development experience with Node.js, Python, and database design.",
    "My strengths include API design, database optimization, and building scalable server architectures.",
    "I design RESTful APIs following standard HTTP methods, proper status codes, and consistent resource naming.",
    "I optimize database performance through indexing, query optimization, connection pooling, and caching strategies.",
    "I implement authentication using JWT tokens, OAuth, and proper session management with security best practices.",
    "I handle errors through try-catch blocks, proper logging, meaningful error messages, and graceful degradation.",
    "I ensure API security through input validation, rate limiting, HTTPS, and protection against common vulnerabilities.",
    "I use caching strategies like Redis for session storage, database query caching, and CDN for static assets.",
    "What is the current backend architecture and what scaling challenges does the team face?"
  ]
};

// Fake Speech-to-Text API
export const fakeSpeechToTextAPI = async (
  request: FakeSpeechToTextRequest,
  category: string = 'fullstack',
  questionIndex: number = 0
): Promise<FakeSpeechToTextResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
  
  const responses = MOCK_RESPONSES[category as keyof typeof MOCK_RESPONSES] || MOCK_RESPONSES.fullstack;
  const transcript = responses[questionIndex] || "I understand the question and will provide a thoughtful response.";
  
  console.log('🎤 Fake Speech-to-Text API:', {
    request: { audio: request.audio.substring(0, 20) + '...' },
    response: { transcript }
  });
  
  return { transcript };
};

// Fake AI Voice/TTS responses
export const getFakeAIVoiceResponse = (text: string, questionIndex: number): FakeAIVoiceResponse => {
  const audioUrl = `/static/ai_question_${questionIndex + 1}.mp3`;
  
  console.log('🔊 Fake AI Voice Response:', {
    audioUrl,
    text: text.substring(0, 50) + '...'
  });
  
  return { audioUrl, text };
};

// Fake WebSocket simulation
export class FakeWebSocket {
  private listeners: { [key: string]: Function[] } = {};
  private isConnected = false;
  
  constructor(url: string) {
    console.log('🔌 Fake WebSocket connecting to:', url);
    
    // Simulate connection delay
    setTimeout(() => {
      this.isConnected = true;
      this.emit('open', {});
      console.log('✅ Fake WebSocket connected');
    }, 100);
  }
  
  send(data: string) {
    if (!this.isConnected) {
      console.warn('⚠️ WebSocket not connected');
      return;
    }
    
    const message = JSON.parse(data);
    console.log('📤 Fake WebSocket Send:', message);
    
    // Simulate server response
    setTimeout(() => {
      if (message.type === 'user_answer') {
        const response: FakeWebSocketMessage = {
          type: 'ai_question',
          content: 'Thank you for your response. Let me ask you another question...',
          questionNumber: (message.questionNumber || 0) + 1,
          totalQuestions: 10,
          timestamp: new Date().toISOString()
        };
        this.emit('message', { data: JSON.stringify(response) });
      }
    }, 1000);
  }
  
  close() {
    this.isConnected = false;
    this.emit('close', {});
    console.log('❌ Fake WebSocket closed');
  }
  
  addEventListener(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  removeEventListener(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }
  
  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

// Fake interview initialization
export const initializeFakeInterview = (payload: any) => {
  console.log('🚀 Initialize Fake Interview:', payload);
  
  return {
    sessionId: payload.context.sessionId,
    status: 'initialized',
    message: 'Interview session created successfully',
    aiPersonality: 'professional', // or 'friendly'
    estimatedDuration: payload.configuration.duration,
    totalQuestions: payload.configuration.questionsLimit || 10
  };
};

// Fake interview completion
export const completeFakeInterview = (payload: any) => {
  console.log('🏁 Complete Fake Interview:', payload);
  
  const feedback = generateFakeFeedback(payload);
  
  return {
    sessionId: payload.sessionId,
    status: 'completed',
    feedback,
    transcript: payload.conversationHistory,
    scores: payload.results.finalScores,
    recommendations: [
      "Practice more system design questions",
      "Work on providing specific examples",
      "Continue developing technical communication skills"
    ]
  };
};

// Generate fake feedback based on interview performance
const generateFakeFeedback = (payload: any) => {
  const questionsAnswered = payload.results.questionsAnswered;
  const totalQuestions = payload.results.totalQuestions;
  const completionRate = (questionsAnswered / totalQuestions) * 100;
  
  let feedback = "Thank you for completing the interview! ";
  
  if (completionRate >= 90) {
    feedback += "You demonstrated excellent communication skills and answered questions thoroughly. ";
  } else if (completionRate >= 70) {
    feedback += "You showed good communication skills and provided solid answers to most questions. ";
  } else {
    feedback += "You participated well in the interview. Consider practicing more to improve your response completeness. ";
  }
  
  feedback += `You answered ${questionsAnswered} out of ${totalQuestions} questions well.`;
  
  return feedback;
};

// Export all fake API functions
export const fakeAPIs = {
  speechToText: fakeSpeechToTextAPI,
  aiVoice: getFakeAIVoiceResponse,
  initializeInterview: initializeFakeInterview,
  completeInterview: completeFakeInterview,
  WebSocket: FakeWebSocket
};