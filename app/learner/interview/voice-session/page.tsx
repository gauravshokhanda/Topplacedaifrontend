'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  Play, 
  Square,
  Send,
  Code,
  Terminal,
  Clock,
  User,
  Bot,
  AlertTriangle,
  Download,
  Volume2,
  VolumeX,
  Pause
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import CodeEditor from '@/components/CodeEditor';
import AIAvatar from '@/components/AIAvatar';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

// Mock payload structure
const MOCK_INTERVIEW_PAYLOAD = {
  user: {
    id: "user123",
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    experience: "3 years in full-stack development",
    skills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
    goals: "Land a senior developer role",
    education: [
      { degree: "B.Tech in Computer Science", institution: "MIT", year: 2020 }
    ],
    workExperience: [
      { 
        title: "Full-Stack Developer", 
        company: "Tech Innovators Inc.", 
        duration: "Jan 2021 - Present", 
        description: "Built scalable web apps using React, Node.js, MongoDB."
      }
    ],
    profileCompletion: 85
  },
  configuration: {
    level: "mid",
    category: "fullstack", 
    duration: 30,
    hasCodeEditor: true,
    language: "javascript",
    interviewType: "voice+code",
    questionsLimit: 10
  },
  context: {
    sessionId: "session_123456",
    startTime: new Date().toISOString(),
    userAgent: navigator.userAgent,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isFreeInterview: true
  }
};

// Mock AI Questions
const MOCK_AI_QUESTIONS = [
  { text: "Hello John, how are you today?", audioUrl: "/static/ai_hello.mp3" },
  { text: "Tell me about yourself and your experience.", audioUrl: "/static/ai_intro.mp3" },
  { text: "What are your strengths as a full-stack developer?", audioUrl: "/static/ai_strengths.mp3" },
  { text: "Can you explain the difference between React and Angular?", audioUrl: "/static/ai_react.mp3" },
  { text: "How do you handle state management in React applications?", audioUrl: "/static/ai_state.mp3" },
  { text: "Write a function to reverse a string in JavaScript.", audioUrl: "/static/ai_code1.mp3" },
  { text: "Explain how you would optimize a slow database query.", audioUrl: "/static/ai_database.mp3" },
  { text: "What is your experience with Node.js and Express?", audioUrl: "/static/ai_nodejs.mp3" },
  { text: "How do you ensure code quality in your projects?", audioUrl: "/static/ai_quality.mp3" },
  { text: "Do you have any questions for me about the role?", audioUrl: "/static/ai_final.mp3" }
];

// Mock user responses for speech-to-text simulation
const MOCK_USER_RESPONSES = [
  "I am doing great, thank you for asking!",
  "I have 3 years of experience in full-stack development, working primarily with React and Node.js.",
  "My strengths include problem-solving, clean code writing, and ability to work with both frontend and backend technologies.",
  "React is a library focused on UI components, while Angular is a full framework with more built-in features.",
  "I use Redux for complex state management and Context API for simpler state sharing between components.",
  "I would use the split and reverse methods, or implement a manual loop solution.",
  "I would analyze the query execution plan, add proper indexes, and optimize the WHERE clauses.",
  "I have extensive experience with Node.js and Express, building RESTful APIs and handling authentication.",
  "I use ESLint, Prettier, write unit tests, and conduct code reviews to maintain high code quality.",
  "Yes, what are the main challenges the team is currently facing?"
];

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  isPlaying?: boolean;
}

function VoiceInterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user, token } = useSelector((state: RootState) => state.auth);

  // Interview configuration
  const level = searchParams.get('level') || 'mid';
  const category = searchParams.get('category') || 'fullstack';
  const duration = searchParams.get('duration') || '30';
  const hasCodeEditor = searchParams.get('hasCodeEditor') === 'true';

  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(parseInt(duration) * 60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [interviewProgress, setInterviewProgress] = useState(0);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Fake WebSocket simulation
  const [fakeWebSocket, setFakeWebSocket] = useState<any>(null);

  // Initialize fake WebSocket
  useEffect(() => {
    if (interviewStarted) {
      const mockWebSocket = {
        send: (data: string) => {
          console.log('Fake WebSocket Send:', JSON.parse(data));
        },
        close: () => {
          console.log('Fake WebSocket Closed');
        }
      };
      setFakeWebSocket(mockWebSocket);
    }
  }, [interviewStarted]);

  // Fake Speech-to-Text API
  const fakeSpeechToText = async (audioData: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock response based on current question
    const mockResponse = MOCK_USER_RESPONSES[currentQuestionIndex] || "I understand the question.";
    
    console.log('Fake Speech-to-Text API Call:', {
      request: { audio: audioData },
      response: { transcript: mockResponse }
    });
    
    return mockResponse;
  };

  // Fake TTS Audio Play
  const playAIAudio = (audioUrl: string, text: string) => {
    setIsAISpeaking(true);
    setCurrentAudioUrl(audioUrl);
    setIsAudioPlaying(true);
    
    // Simulate audio playing
    console.log('Playing AI Audio:', { audioUrl, text });
    
    // Simulate audio duration (3-5 seconds)
    const duration = Math.random() * 2000 + 3000;
    setTimeout(() => {
      setIsAISpeaking(false);
      setIsAudioPlaying(false);
      setCurrentAudioUrl(null);
    }, duration);
  };

  // Initialize camera and microphone
  useEffect(() => {
    async function initializeMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Failed to access media devices:', err);
        setWarningMessage('Camera and microphone access is required for the interview.');
        setShowWarning(true);
      }
    }

    initializeMedia();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!interviewStarted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleEndInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewStarted]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update progress
  useEffect(() => {
    const progress = (questionsAnswered / MOCK_AI_QUESTIONS.length) * 100;
    setInterviewProgress(progress);
  }, [questionsAnswered]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMic = () => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach(track => {
        track.enabled = !isMicOn;
      });
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach(track => {
        track.enabled = !isCameraOn;
      });
      setIsCameraOn(!isCameraOn);
    }
  };

  const startInterview = async () => {
    console.log('Initialize Interview Payload:', MOCK_INTERVIEW_PAYLOAD);
    
    setInterviewStarted(true);
    
    // Start with first AI question
    askNextQuestion();
  };

  const askNextQuestion = () => {
    if (currentQuestionIndex >= MOCK_AI_QUESTIONS.length) {
      handleEndInterview();
      return;
    }

    const question = MOCK_AI_QUESTIONS[currentQuestionIndex];
    const aiMessage: Message = {
      id: `ai_${Date.now()}`,
      type: 'ai',
      content: question.text,
      timestamp: new Date(),
      audioUrl: question.audioUrl
    };

    setMessages(prev => [...prev, aiMessage]);
    
    // Play AI audio
    playAIAudio(question.audioUrl, question.text);

    // Simulate WebSocket message
    if (fakeWebSocket) {
      const wsMessage = {
        type: "ai_question",
        content: question.text,
        questionNumber: currentQuestionIndex + 1,
        totalQuestions: MOCK_AI_QUESTIONS.length
      };
      fakeWebSocket.send(JSON.stringify(wsMessage));
    }
  };

  const startListening = async () => {
    if (!isMicOn) {
      setWarningMessage('Please enable your microphone to respond.');
      setShowWarning(true);
      return;
    }

    setIsListening(true);
    setTranscript('Listening...');

    try {
      // Simulate recording audio
      const fakeAudioData = "base64-fake-audio-data";
      
      // Call fake speech-to-text API
      const transcriptResult = await fakeSpeechToText(fakeAudioData);
      
      setTranscript(transcriptResult);
      
      // Add user message
      const userMessage: Message = {
        id: `user_${Date.now()}`,
        type: 'user',
        content: transcriptResult,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      
      // Simulate WebSocket response
      if (fakeWebSocket) {
        const wsMessage = {
          type: "user_answer",
          content: transcriptResult,
          questionNumber: currentQuestionIndex + 1
        };
        fakeWebSocket.send(JSON.stringify(wsMessage));
      }

      setQuestionsAnswered(prev => prev + 1);
      setCurrentQuestionIndex(prev => prev + 1);

      // Wait a moment then ask next question
      setTimeout(() => {
        askNextQuestion();
      }, 2000);

    } catch (error) {
      console.error('Speech recognition error:', error);
      setTranscript('Error recognizing speech. Please try again.');
    } finally {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    setTranscript('');
  };

  const runCode = async () => {
    if (!code.trim()) return;

    const codeMessage: Message = {
      id: `code_${Date.now()}`,
      type: 'user',
      content: `Code submitted:\n\`\`\`${language}\n${code}\n\`\`\``,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, codeMessage]);

    // Simulate code execution
    setTimeout(() => {
      const resultMessage: Message = {
        id: `result_${Date.now()}`,
        type: 'ai',
        content: `Code executed successfully! Output: "Hello World"\n\nGood job! Your solution looks clean and efficient.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, resultMessage]);
    }, 1000);
  };

  const handleEndInterview = async () => {
    const completionPayload = {
      sessionId: MOCK_INTERVIEW_PAYLOAD.context.sessionId,
      user: MOCK_INTERVIEW_PAYLOAD.user,
      configuration: MOCK_INTERVIEW_PAYLOAD.configuration,
      results: {
        status: 'completed',
        completedAt: new Date().toISOString(),
        totalTimeSpent: (parseInt(duration) * 60) - timeRemaining,
        questionsAnswered,
        totalQuestions: MOCK_AI_QUESTIONS.length,
        finalScores: {
          overall: 85,
          technical: 88,
          communication: 82,
          problemSolving: 87
        }
      },
      conversationHistory: messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      })),
      codeSubmissions: hasCodeEditor ? [{
        questionId: 'coding_challenge',
        question: 'Write a function to reverse a string',
        code,
        language,
        submittedAt: new Date().toISOString()
      }] : [],
      violations: [],
      aiAnalysis: {
        strengths: ["Good communication skills", "Clear explanations", "Solid technical knowledge"],
        improvements: ["Could provide more specific examples", "Practice system design concepts"],
        detailedFeedback: {
          communication: "You communicated clearly and confidently throughout the interview.",
          technical: "Strong technical foundation with good problem-solving approach.",
          problemSolving: "Demonstrated logical thinking and systematic approach to problems."
        },
        recommendations: ["Practice more system design questions", "Work on providing concrete examples"]
      }
    };

    console.log('Complete Interview Payload:', completionPayload);

    // Cleanup media streams
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }

    setInterviewStarted(false);
    router.push('/learner/interview/results');
  };

  const downloadTranscript = () => {
    const transcript = messages.map(msg => 
      `[${msg.timestamp.toLocaleTimeString()}] ${msg.type.toUpperCase()}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview_transcript_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const replayAIMessage = (message: Message) => {
    if (message.audioUrl) {
      playAIAudio(message.audioUrl, message.content);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center">
          <div className="glass-card p-8 max-w-md text-center border-2 border-red-500/50">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4 text-red-400">Interview Warning</h3>
            <p className="text-gray-300 mb-6">{warningMessage}</p>
            <button
              onClick={() => setShowWarning(false)}
              className="btn-primary px-6 py-2"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      <div className="pt-16">
        {/* Header Bar */}
        <div className="bg-[#0A0A0A] border-b border-[#00FFB2]/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Clock size={20} className="text-[#00FFB2]" />
                <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
              </div>
              <div className="text-sm text-gray-400">
                Voice Interview • {category?.toUpperCase()} • {level?.toUpperCase()}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Progress:</span>
                <div className="w-32 bg-[#1A1A1A] rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${interviewProgress}%` }}
                  />
                </div>
                <span className="text-sm text-[#00FFB2]">{questionsAnswered}/{MOCK_AI_QUESTIONS.length}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleMic}
                className={`p-2 rounded-full ${isMicOn ? 'bg-[#00FFB2]/20 text-[#00FFB2]' : 'bg-red-500/20 text-red-400'}`}
              >
                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              
              <button
                onClick={toggleCamera}
                className={`p-2 rounded-full ${isCameraOn ? 'bg-[#00FFB2]/20 text-[#00FFB2]' : 'bg-red-500/20 text-red-400'}`}
              >
                {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>

              <button
                onClick={downloadTranscript}
                className="p-2 rounded-full bg-[#00FFB2]/20 text-[#00FFB2] hover:bg-[#00FFB2]/30"
                title="Download Transcript"
              >
                <Download size={20} />
              </button>
              
              <button
                onClick={handleEndInterview}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Phone size={16} />
                <span>End Interview</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-120px)]">
          {/* Left Panel - Video and Chat */}
          <div className="w-1/2 flex flex-col border-r border-[#00FFB2]/20">
            {/* Video Section */}
            <div className="h-1/2 bg-[#0A0A0A] p-4">
              <div className="grid grid-cols-2 gap-4 h-full">
                {/* User Video */}
                <div className="bg-[#111] rounded-lg overflow-hidden relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                    You
                  </div>
                  {isListening && (
                    <div className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded text-xs animate-pulse">
                      Recording...
                    </div>
                  )}
                </div>
                
                {/* AI Avatar */}
                <div className="bg-[#111] rounded-lg overflow-hidden relative">
                  <AIAvatar isActive={isAISpeaking} />
                  <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                    AI Interviewer
                  </div>
                  {isAudioPlaying && (
                    <div className="absolute top-2 right-2 bg-[#00FFB2] px-2 py-1 rounded text-xs text-black">
                      Speaking...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Section */}
            <div className="h-1/2 flex flex-col bg-[#0A0A0A]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-[#00FFB2] text-black' 
                        : 'bg-[#1A1A1A] text-white'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          {message.type === 'user' ? (
                            <User size={16} />
                          ) : (
                            <Bot size={16} className="text-[#00FFB2]" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        {message.type === 'ai' && message.audioUrl && (
                          <button
                            onClick={() => replayAIMessage(message)}
                            className="text-[#00FFB2] hover:text-[#00CC8E] ml-2"
                            title="Replay Audio"
                          >
                            <Volume2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Voice Input Section */}
              <div className="p-4 border-t border-[#00FFB2]/20">
                <div className="flex flex-col space-y-3">
                  {transcript && (
                    <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#00FFB2]/20">
                      <div className="text-sm text-gray-400 mb-1">Transcript:</div>
                      <div className="text-white">{transcript}</div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={isListening ? stopListening : startListening}
                      disabled={!interviewStarted || isAISpeaking}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isListening 
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                          : 'bg-[#00FFB2] hover:bg-[#00CC8E]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isListening ? (
                        <Square size={24} className="text-white" />
                      ) : (
                        <Mic size={24} className="text-black" />
                      )}
                    </button>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-400">
                        {isListening ? 'Recording... Click to stop' : 'Click to speak'}
                      </div>
                      {!isMicOn && (
                        <div className="text-xs text-red-400 mt-1">
                          Microphone is disabled
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Code Editor (if applicable) */}
          {hasCodeEditor ? (
            <div className="w-1/2 flex flex-col">
              <div className="bg-[#0A0A0A] border-b border-[#00FFB2]/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Code size={20} className="text-[#00FFB2]" />
                    <span className="font-semibold">Code Editor</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-600 rounded px-3 py-1 text-sm"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="sql">SQL</option>
                    </select>
                    <button
                      onClick={runCode}
                      className="btn-primary px-4 py-1 text-sm flex items-center space-x-1"
                    >
                      <Terminal size={14} />
                      <span>Run</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={language}
                  theme="dark"
                />
              </div>
            </div>
          ) : (
            <div className="w-1/2 flex items-center justify-center bg-[#0A0A0A]">
              <div className="text-center">
                <Bot size={48} className="text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Voice Interview</h3>
                <p className="text-gray-400 mb-4">
                  This interview focuses on verbal communication and behavioral questions.
                </p>
                <div className="bg-[#1A1A1A] p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Interview Tips:</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Speak clearly and at a moderate pace</li>
                    <li>• Provide specific examples when possible</li>
                    <li>• Take a moment to think before answering</li>
                    <li>• Ask for clarification if needed</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Start Interview Overlay */}
        {!interviewStarted && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="glass-card p-8 text-center max-w-md">
              <Bot size={64} className="text-[#00FFB2] mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Voice Interview Ready</h2>
              <p className="text-gray-400 mb-6">
                Your {category} voice interview at {level} level is about to begin. 
                Duration: {duration} minutes with {MOCK_AI_QUESTIONS.length} questions.
              </p>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <p className="text-blue-400 text-sm">
                  <strong>Voice Interview:</strong> The AI will ask questions with voice. 
                  Click the microphone button to respond with your voice.
                </p>
              </div>
              <button
                onClick={startInterview}
                className="btn-primary px-8 py-3 text-lg flex items-center justify-center mx-auto"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Voice Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VoiceInterviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VoiceInterviewContent />
    </Suspense>
  );
}