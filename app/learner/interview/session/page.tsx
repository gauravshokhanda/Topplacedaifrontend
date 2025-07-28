'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  Settings, 
  Play, 
  Square,
  Send,
  Code,
  Terminal,
  FileText,
  Clock,
  User,
  Bot
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import CodeEditor from '@/components/CodeEditor';
import AIAvatar from '@/components/AIAvatar';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function InterviewSessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Interview configuration
  const level = searchParams.get('level');
  const category = searchParams.get('category');
  const duration = searchParams.get('duration');
  const hasCodeEditor = searchParams.get('hasCodeEditor') === 'true';

  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(parseInt(duration || '45') * 60);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: string;
    type: 'ai' | 'user';
    content: string;
    timestamp: Date;
  }>>([]);
  const [userInput, setUserInput] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

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
      }
    }

    initializeMedia();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
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
    setInterviewStarted(true);
    setIsAISpeaking(true);
    
    // Initialize interview with AI
    const welcomeMessage = `Hello! I'm your AI interviewer for today's ${category} interview at ${level} level. This session will last ${duration} minutes. Let's begin with a brief introduction - please tell me about yourself and your experience.`;
    
    setMessages([{
      id: Date.now().toString(),
      type: 'ai',
      content: welcomeMessage,
      timestamp: new Date()
    }]);

    // Simulate AI speaking
    setTimeout(() => {
      setIsAISpeaking(false);
    }, 3000);
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsAISpeaking(true);

    try {
      // Send to your backend AI
      const response = await fetch(`${API_URL}/ai/interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          code: hasCodeEditor ? code : null,
          language: hasCodeEditor ? language : null,
          category,
          level,
          conversationHistory: messages
        }),
      });

      const data = await response.json();
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: data.response || 'I understand. Let me ask you another question...',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: 'I apologize, but I encountered a technical issue. Let\'s continue with the next question.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAISpeaking(false);
    }
  };

  const runCode = async () => {
    if (!code.trim()) return;

    try {
      const response = await fetch(`${API_URL}/code/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          category,
          level
        }),
      });

      const result = await response.json();
      
      const codeResultMessage = {
        id: Date.now().toString(),
        type: 'ai' as const,
        content: `Code execution result:\n\`\`\`\n${result.output || result.error}\n\`\`\`\n\n${result.feedback || 'Good work! Let\'s continue.'}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, codeResultMessage]);
    } catch (error) {
      console.error('Error executing code:', error);
    }
  };

  const handleEndInterview = () => {
    setInterviewStarted(false);
    router.push('/learner/interview/results');
  };

  const getLanguageOptions = () => {
    switch (category) {
      case 'frontend':
        return ['javascript', 'typescript', 'html', 'css'];
      case 'backend':
        return ['javascript', 'python', 'java', 'go', 'csharp'];
      case 'fullstack':
        return ['javascript', 'typescript', 'python', 'java'];
      case 'sql':
        return ['sql'];
      case 'data-analyst':
        return ['python', 'r', 'sql'];
      case 'aws':
        return ['yaml', 'json', 'bash'];
      default:
        return ['javascript', 'python', 'java'];
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="pt-16">
        {/* Header Bar */}
        <div className="bg-[#0A0A0A] border-b border-[#00FFB2]/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock size={20} className="text-[#00FFB2]" />
                <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
              </div>
              <div className="text-sm text-gray-400">
                {category?.toUpperCase()} • {level?.toUpperCase()} Level
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
                </div>
                
                {/* AI Avatar */}
                <div className="bg-[#111] rounded-lg overflow-hidden relative">
                  <AIAvatar isActive={isAISpeaking} />
                  <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                    AI Interviewer
                  </div>
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
                      <div className="flex items-center space-x-2 mb-1">
                        {message.type === 'user' ? (
                          <User size={16} />
                        ) : (
                          <Bot size={16} className="text-[#00FFB2]" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t border-[#00FFB2]/20">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your response..."
                    className="flex-1 bg-[#1A1A1A] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFB2]"
                    disabled={!interviewStarted || isAISpeaking}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!interviewStarted || isAISpeaking || !userInput.trim()}
                    className="btn-primary px-4 py-2 disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
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
                      {getLanguageOptions().map(lang => (
                        <option key={lang} value={lang}>
                          {lang.toUpperCase()}
                        </option>
                      ))}
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
                <FileText size={48} className="text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Interview Notes</h3>
                <p className="text-gray-400">
                  This interview focuses on behavioral and conceptual questions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Start Interview Overlay */}
        {!interviewStarted && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="glass-card p-8 text-center max-w-md">
              <h2 className="text-2xl font-bold mb-4">Ready to Start?</h2>
              <p className="text-gray-400 mb-6">
                Your {category} interview at {level} level is about to begin. 
                Duration: {duration} minutes.
              </p>
              <button
                onClick={startInterview}
                className="btn-primary px-8 py-3 text-lg flex items-center justify-center mx-auto"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InterviewSessionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InterviewSessionContent />
    </Suspense>
  );
}