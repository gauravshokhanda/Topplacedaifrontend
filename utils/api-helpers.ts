// API Helper Functions for Interview System

import { 
  InitializeInterviewPayload, 
  AIConversationPayload, 
  CodeExecutionPayload,
  CompleteInterviewPayload,
  GetAIResponsePayload 
} from '@/types/interview-payloads';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 1. Initialize Interview Session
export async function initializeInterview(payload: InitializeInterviewPayload) {
  const response = await fetch(`${API_URL}/interview/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// 2. Send Message to AI (Real-time conversation)
export async function sendMessageToAI(payload: AIConversationPayload) {
  const response = await fetch(`${API_URL}/interview/ai-conversation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// 3. Execute Code
export async function executeCode(payload: CodeExecutionPayload) {
  const response = await fetch(`${API_URL}/interview/execute-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// 4. Update Interview Progress (Real-time updates)
export async function updateInterviewProgress(payload: any) {
  const response = await fetch(`${API_URL}/interview/progress`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// 5. Complete Interview
export async function completeInterview(payload: CompleteInterviewPayload) {
  const response = await fetch(`${API_URL}/interview/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// 6. Get AI Response (Alternative endpoint)
export async function getAIResponse(payload: GetAIResponsePayload) {
  const response = await fetch(`${API_URL}/ai/interview-response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// Helper function to build user profile from Redux state
export function buildUserProfile(user: any) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    experience: user.experience,
    skills: user.tech_stack ? user.tech_stack.split(',') : [],
    goals: user.goals,
    education: user.education || [],
    workExperience: user.work_experience || [],
    resumeUrl: user.resume_url,
    profileCompletion: user.profile_completion
  };
}

// Add this helper function at the top of the file
function mapLevelToBackend(frontendLevel: string): 'beginner' | 'intermediate' | 'advanced' {
  const levelMap: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
    'entry': 'beginner',
    'mid': 'intermediate', 
    'senior': 'advanced',
    'lead': 'advanced'
  };
  return levelMap[frontendLevel] || 'intermediate';
}

// Helper function to build interview configuration
export function buildInterviewConfig(level: string, category: string, duration: string) {
  const hasCodeEditor = !['hr', 'product-manager'].includes(category);
  
  return {
    level: mapLevelToBackend(level), // Map the level here
    category: category as any,
    duration: parseInt(duration),
    hasCodeEditor,
    language: getDefaultLanguage(category)
  };
}

// Helper function to get default programming language
function getDefaultLanguage(category: string): string {
  switch (category) {
    case 'frontend': return 'javascript';
    case 'backend': return 'python';
    case 'fullstack': return 'javascript';
    case 'sql': return 'sql';
    case 'data-analyst': return 'python';
    case 'aws': return 'yaml';
    case 'devops': return 'bash';
    default: return 'javascript';
  }
}