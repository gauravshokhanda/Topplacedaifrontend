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
  Pause,
  Maximize2,
  Minimize2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import CodeEditor from '@/components/CodeEditor';
import AIAvatar from '@/components/AIAvatar';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { io, Socket } from 'socket.io-client';

// Your backend API URL
const API_URL = 'https://1facc094d653.ngrok-free.app';
const WEBSOCKET_URL = 'http://localhost:3002';

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
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<any>(null);

  // Real WebSocket connection
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize real WebSocket
  useEffect(() => {
    const socketConnection = io(WEBSOCKET_URL);
    
    socketConnection.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      setSocket(socketConnection);
    });

    socketConnection.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socketConnection.on('welcome', (data) => {
      console.log('Welcome message:', data);
    });

    socketConnection.on('init-interview-response', (data) => {
      if (data.success) {
        setSessionId(data.sessionId);
        console.log('Interview initialized:', data);
        
        // Add AI welcome message
        const welcomeMessage: Message = {
          id: `ai_welcome_${Date.now()}`,
          type: 'ai',
          content: data.message,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        
        // Play welcome audio
        playAIAudio('', data.message);
      }
    });

    socketConnection.on('question-response', (data) => {
      if (data.success) {
        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        playAIAudio('', data.response);
      }
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  // Build interview payload from user data
  const buildInterviewPayload = () => {
    return {
      user: {
        id: user?._id || "user123",
        name: user?.name || "John Doe",
        email: user?.email || "john@example.com",
        role: user?.role || "user",
        experience: user?.experience || "3 years in full-stack development",
        skills: user?.tech_stack ? user.tech_stack.split(',') : ["JavaScript", "React", "Node.js", "Python", "SQL"],
        goals: user?.goals || "Land a senior developer role",
        education: user?.education ? JSON.parse(user.education) : [
          { degree: "B.Tech in Computer Science", institution: "IIT Delhi", year: 2019 }
        ],
        workExperience: [
          {
            title: "Full-Stack Developer",
            company: "TechNova Solutions",
            duration: "Jan 2021 - Present",
            description: "Led development of scalable web applications using React and Node.js."
          }
        ],
        profileCompletion: user?.profile_completion || 85
      },
      configuration: {
        level: level || "mid",
        category: category || "fullstack",
        duration: parseInt(duration) || 30,
        hasCodeEditor: hasCodeEditor,
        language: language || "javascript"
      },
      context: {
        sessionId: `session_${Date.now()}_${user?._id}`,
        startTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isFreeInterview: true
      }
    }

  // Initialize Google Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        
        // Add user message
        const userMessage: Message = {
          id: `user_${Date.now()}`,
          type: 'user',
          content: transcript,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        
        // Send to real WebSocket
        if (socket && sessionId) {
          socket.emit('question', {
            sessionId: sessionId,
            message: transcript
          });
        }

        setQuestionsAnswered(prev => prev + 1);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setTranscript('Error recognizing speech. Please try again.');
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
    
    // Initialize Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  // Real TTS Audio Play using Google Text-to-Speech
  const playAIAudio = async (audioUrl: string, text: string) => {
    setIsAISpeaking(true);
    setCurrentAudioUrl(audioUrl);
    setIsAudioPlaying(true);
    
    if (speechSynthesis) {
      // Use browser's built-in speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Get a female voice if available
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Karen') ||
        voice.gender === 'female'
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      utterance.onend = () => {
        setIsAISpeaking(false);
        setIsAudioPlaying(false);
        setCurrentAudioUrl(null);
      };
      
      speechSynthesis.speak(utterance);
    } else {
      // Fallback to simulation
      console.log('Playing AI Audio:', { audioUrl, text });
      const duration = Math.random() * 2000 + 3000;
      setTimeout(() => {
        setIsAISpeaking(false);
        setIsAudioPlaying(false);
        setCurrentAudioUrl(null);
      }, duration);
    }
  };

  // Google Speech-to-Text API call
  const callGoogleSpeechToText = async (audioBlob: Blob): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Speech-to-text API failed');
      }
      
      const data = await response.json();
      return data.transcript || 'Could not transcribe audio';
    } catch (error) {
      console.error('Google Speech-to-Text error:', error);
      // Fallback to mock response
      return MOCK_USER_RESPONSES[currentQuestionIndex] || "I understand the question.";
    }
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
    if (!socket || !isConnected) {
      setWarningMessage('WebSocket connection not established. Please try again.');
      setShowWarning(true);
      return;
    }

    const payload = buildInterviewPayload();
    console.log('Initialize Interview Payload:', payload);
    
    setInterviewStarted(true);
    
    // Send initialization to WebSocket
    socket.emit('init-interview', payload);
  };


  const startListening = async () => {
    if (!isMicOn) {
      setWarningMessage('Please enable your microphone to respond.');
      setShowWarning(true);
      return;
    }

    setIsListening(true);
    setTranscript('Listening...');

    if (recognition) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setIsListening(false);
        setTranscript('Speech recognition not available. Please try again.');
      }
    } else {
      // Fallback to mock response
      setTimeout(async () => {
        const mockResponse = MOCK_USER_RESPONSES[currentQuestionIndex] || "I understand the question.";
        setTranscript(mockResponse);
        
        const userMessage: Message = {
          id: `user_${Date.now()}`,
          type: 'user',
          content: mockResponse,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setQuestionsAnswered(prev => prev + 1);

        // Send to WebSocket
        if (socket && sessionId) {
          socket.emit('question', {
            sessionId: sessionId,
            message: mockResponse
          });
        }
        
        setIsListening(false);
      }, 2000);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
    setTranscript('');
  };

  const runCode = async () => {
    if (!code.trim()) return;

    try {
      // Call your backend API for code execution
      const response = await fetch(`${API_URL}/interview/code/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          code: code,
          language: language.toUpperCase(),
          codeContext: {
            questionId: `code_${Date.now()}`,
            question: "Code execution challenge"
          }
        })
      });

      const result = await response.json();
      
      const codeMessage: Message = {
        id: `code_${Date.now()}`,
        type: 'user',
        content: `Code submitted:\n\`\`\`${language}\n${code}\n\`\`\``,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, codeMessage]);

      // Show execution result
      const resultMessage: Message = {
        id: `result_${Date.now()}`,
        type: 'ai',
        content: result.success ? 
          `Code executed successfully!\n\nOutput: ${result.output || 'No output'}\n\n${result.feedback || 'Good job!'}` :
          `Code execution failed: ${result.message || 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, resultMessage]);
      
    } catch (error) {
      console.error('Code execution error:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: 'ai',
        content: 'Sorry, there was an error executing your code. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleEndInterview = async () => {
    try {
      // Call your backend API to end interview
      const payload = buildInterviewPayload();
      const completionPayload = {
        sessionId: sessionId,
        user: payload.user,
        configuration: payload.configuration,
        results: {
          status: 'completed',
          completedAt: new Date().toISOString(),
          totalTimeSpent: (parseInt(duration) * 60) - timeRemaining,
          questionsAnswered,
          totalQuestions: messages.filter(m => m.type === 'ai').length,
          finalScores: {
            overall: 0, // Will be calculated by backend
            technical: 0,
            communication: 0,
            problemSolving: 0
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
          question: 'Code execution challenge',
          code,
          language,
          submittedAt: new Date().toISOString()
        }] : [],
        violations: [],
        aiAnalysis: {
          strengths: [],
          improvements: [],
          detailedFeedback: {},
          recommendations: []
        }
      };

      const response = await fetch(`${API_URL}/interview/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completionPayload)
      });

      const result = await response.json();
      console.log('Interview completion result:', result);
      
    } catch (error) {
      console.error('Error ending interview:', error);
    }

    // Cleanup media streams
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }

    // Disconnect WebSocket
    if (socket) {
      socket.disconnect();
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
              
              {hasCodeEditor && (
                <button
                  onClick={() => setShowCodeEditor(!showCodeEditor)}
                  className="p-2 rounded-full bg-[#00FFB2]/20 text-[#00FFB2] hover:bg-[#00FFB2]/30"
                  title={showCodeEditor ? "Hide Code Editor" : "Show Code Editor"}
                >
                  {showCodeEditor ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
              )}
              
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
          {hasCodeEditor && showCodeEditor ? (
            <div className="w-1/2 flex flex-col">
              <div className="bg-[#0A0A0A] border-b border-[#00FFB2]/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Code size={20} className="text-[#00FFB2]" />
                    <span className="font-semibold">Code Editor</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowCodeEditor(false)}
                      className="p-1 rounded bg-[#1A1A1A] hover:bg-[#333] text-gray-400 hover:text-white"
                      title="Close Code Editor"
                    >
                      <Minimize2 size={16} />
                    </button>
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
          ) : hasCodeEditor && !showCodeEditor ? (
            <div className="w-1/2 flex items-center justify-center bg-[#0A0A0A] border-l border-[#00FFB2]/20">
              <div className="text-center">
                <Code size={48} className="text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Code Editor Available</h3>
                <p className="text-gray-400 mb-4">
                  Click the code editor button in the header to open the coding environment.
                </p>
                <button
                  onClick={() => setShowCodeEditor(true)}
                  className="btn-primary flex items-center mx-auto"
                >
                  <Code size={16} className="mr-2" />
                  Open Code Editor
                </button>
              </div>
            </div>
          ) : !hasCodeEditor ? (
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
          ) : null}
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
                  Click the microphone button to respond with your voice.<br/>
                  <strong>Status:</strong> {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
                </p>
              </div>
              <button
                onClick={startInterview}
                disabled={!isConnected}
                className="btn-primary px-8 py-3 text-lg flex items-center justify-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-5 w-5 mr-2" />
                {isConnected ? 'Start Voice Interview' : 'Connecting...'}
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