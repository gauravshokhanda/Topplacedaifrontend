// AI Interview Backend Payload Types and Structures

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'mentor';
  experience?: string;
  skills?: string[];
  goals?: string;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  workExperience?: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  resumeUrl?: string;
  profileCompletion?: number;
}

export interface InterviewConfiguration {
  level: 'entry' | 'mid' | 'senior' | 'lead';
  category: 'hr' | 'product-manager' | 'fullstack' | 'frontend' | 'backend' | 'sql' | 'data-analyst' | 'aws' | 'devops';
  duration: number; // in minutes
  hasCodeEditor: boolean;
  language?: string; // programming language if applicable
}

export interface InterviewContext {
  sessionId: string;
  startTime: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  tabSwitchCount: number;
  isFullscreen: boolean;
}

// 1. INITIALIZE INTERVIEW SESSION PAYLOAD
export interface InitializeInterviewPayload {
  user: UserProfile;
  configuration: InterviewConfiguration;
  context: {
    sessionId: string;
    startTime: string;
    userAgent: string;
    timezone: string;
    isFreeInterview: boolean;
  };
}

// 2. AI CONVERSATION PAYLOAD (Real-time chat)
export interface AIConversationPayload {
  sessionId: string;
  user: {
    id: string;
    name: string;
    level: string;
    category: string;
  };
  message: {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: string;
  };
  conversationHistory: Array<{
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: string;
  }>;
  currentContext: {
    questionNumber: number;
    timeElapsed: number;
    timeRemaining: number;
    currentTopic?: string;
    difficulty: string;
  };
  userSkills: string[];
  interviewGoals: string[];
  codeContext?: {
    hasCodeEditor: boolean;
    currentCode?: string;
    language?: string;
    codeSubmissions: number;
  };
}

// 3. CODE EXECUTION PAYLOAD
export interface CodeExecutionPayload {
  sessionId: string;
  user: {
    id: string;
    name: string;
    level: string;
    category: string;
  };
  code: {
    content: string;
    language: string;
    questionContext: string;
    submissionNumber: number;
  };
  interviewContext: {
    timeElapsed: number;
    currentQuestion: string;
    expectedOutput?: string;
    testCases?: Array<{
      input: any;
      expectedOutput: any;
    }>;
  };
}

// 4. INTERVIEW PROGRESS UPDATE PAYLOAD
export interface InterviewProgressPayload {
  sessionId: string;
  user: {
    id: string;
    name: string;
  };
  progress: {
    currentQuestionIndex: number;
    questionsAnswered: number;
    timeElapsed: number;
    timeRemaining: number;
    tabSwitchCount: number;
    violations: Array<{
      type: 'tab_switch' | 'fullscreen_exit' | 'right_click' | 'keyboard_shortcut';
      timestamp: string;
      description: string;
    }>;
  };
  currentPerformance: {
    communicationScore: number;
    technicalScore: number;
    problemSolvingScore: number;
    codeQualityScore?: number;
  };
}

// 5. COMPLETE INTERVIEW PAYLOAD
export interface CompleteInterviewPayload {
  sessionId: string;
  user: UserProfile;
  configuration: InterviewConfiguration;
  results: {
    status: 'completed' | 'terminated' | 'incomplete';
    completedAt: string;
    totalTimeSpent: number;
    questionsAnswered: number;
    totalQuestions: number;
    finalScores: {
      overall: number;
      technical: number;
      communication: number;
      problemSolving: number;
      codeQuality?: number;
    };
  };
  conversationHistory: Array<{
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: string;
  }>;
  codeSubmissions?: Array<{
    questionId: string;
    question: string;
    code: string;
    language: string;
    submittedAt: string;
    executionResult?: any;
    score?: number;
    feedback?: string;
  }>;
  violations: Array<{
    type: string;
    timestamp: string;
    description: string;
  }>;
  aiAnalysis: {
    strengths: string[];
    improvements: string[];
    detailedFeedback: {
      technical?: string;
      communication?: string;
      problemSolving?: string;
      codeQuality?: string;
    };
    recommendations: string[];
  };
}

// 6. GET AI RESPONSE PAYLOAD
export interface GetAIResponsePayload {
  sessionId: string;
  userMessage: string;
  userProfile: {
    id: string;
    name: string;
    skills: string[];
    experience: string;
    goals: string[];
  };
  interviewConfig: {
    level: string;
    category: string;
    duration: number;
    currentTime: number;
  };
  conversationContext: {
    previousMessages: Array<{
      role: 'user' | 'assistant';
      content: string;
      timestamp: string;
    }>;
    currentTopic: string;
    questionNumber: number;
    expectedResponseType: 'text' | 'code' | 'explanation';
  };
  codeContext?: {
    currentCode: string;
    language: string;
    isExecutable: boolean;
  };
}

// EXAMPLE USAGE PAYLOADS:

// Example 1: Initialize Interview
export const exampleInitializePayload: InitializeInterviewPayload = {
  user: {
    id: "user123",
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    experience: "3 years in full-stack development",
    skills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
    goals: "Land a senior developer role at a tech company",
    education: [{
      degree: "Bachelor of Computer Science",
      institution: "MIT",
      year: "2020"
    }],
    workExperience: [{
      title: "Full-Stack Developer",
      company: "TechCorp",
      duration: "2021-2024",
      description: "Built web applications using React and Node.js"
    }],
    profileCompletion: 85
  },
  configuration: {
    level: "mid",
    category: "fullstack",
    duration: 30,
    hasCodeEditor: true,
    language: "javascript"
  },
  context: {
    sessionId: "session_123456",
    startTime: "2024-01-20T10:00:00Z",
    userAgent: "Mozilla/5.0...",
    timezone: "America/New_York",
    isFreeInterview: true
  }
};

// Example 2: AI Conversation
export const exampleConversationPayload: AIConversationPayload = {
  sessionId: "session_123456",
  user: {
    id: "user123",
    name: "John Doe",
    level: "mid",
    category: "fullstack"
  },
  message: {
    id: "msg_001",
    type: "user",
    content: "I have 3 years of experience in full-stack development, primarily working with React and Node.js. I've built several e-commerce applications and have experience with databases like MongoDB and PostgreSQL.",
    timestamp: "2024-01-20T10:05:00Z"
  },
  conversationHistory: [
    {
      id: "msg_000",
      type: "ai",
      content: "Hello! I'm your AI interviewer. Let's start with a brief introduction - please tell me about your experience and background.",
      timestamp: "2024-01-20T10:00:00Z"
    }
  ],
  currentContext: {
    questionNumber: 1,
    timeElapsed: 300, // 5 minutes
    timeRemaining: 1500, // 25 minutes
    currentTopic: "introduction",
    difficulty: "mid"
  },
  userSkills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
  interviewGoals: ["Land a senior developer role"],
  codeContext: {
    hasCodeEditor: true,
    currentCode: "",
    language: "javascript",
    codeSubmissions: 0
  }
};

// Example 3: Code Execution
export const exampleCodeExecutionPayload: CodeExecutionPayload = {
  sessionId: "session_123456",
  user: {
    id: "user123",
    name: "John Doe",
    level: "mid",
    category: "fullstack"
  },
  code: {
    content: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    language: "javascript",
    questionContext: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    submissionNumber: 1
  },
  interviewContext: {
    timeElapsed: 900, // 15 minutes
    currentQuestion: "Two Sum Problem",
    expectedOutput: "[0, 1]",
    testCases: [
      {
        input: { nums: [2, 7, 11, 15], target: 9 },
        expectedOutput: [0, 1]
      },
      {
        input: { nums: [3, 2, 4], target: 6 },
        expectedOutput: [1, 2]
      }
    ]
  }
};