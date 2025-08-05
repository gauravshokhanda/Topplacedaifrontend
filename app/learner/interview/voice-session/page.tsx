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
  Send,
  Code,
  Terminal,
  FileText,
  Clock,
  User,
  Bot,
  AlertTriangle,
  X
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import CodeEditor from '@/components/CodeEditor';
import AIAvatar from '@/components/AIAvatar';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function InterviewSessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, token } = useSelector((state: RootState) => state.auth);

  // Interview configuration
  const level = searchParams.get('level');
  const category = searchParams.get('category');
  const duration = searchParams.get('duration');
  const hasCodeEditor = searchParams.get('hasCodeEditor') === 'true';

  // State management
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(parseInt(duration || '45') * 60);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentQuestionId, setCurrentQuestionId] = useState('');
  const [sessionId, setSessionId] = useState('');
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
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMobileCodeEditor, setShowMobileCodeEditor] = useState(false);
  const [progress, setProgress] = useState({
    questionsAnswered: 0,
    totalQuestions: 6,
    completionPercentage: 0
  });

  // Cleanup media streams
  const cleanupMediaStreams = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
      setMediaStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsMicOn(false);
    setIsCameraOn(false);
  }, [mediaStream]);

  // Check free trial usage
  useEffect(() => {
    const checkFreeTrialUsage = async () => {
      try {
        const response = await fetch(`${API_URL}/users/${user?._id}/interview-usage`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        
        if (data.freeInterviewsUsed >= 2 && !data.hasPaidPlan) {
          setWarningMessage('You have used your 2 free interviews. Please upgrade to continue.');
          setShowWarning(true);
          setTimeout(() => {
            router.push('/pricing');
          }, 3000);
        }
      } catch (error) {
        console.error('Error checking trial usage:', error);
      }
    };

    if (user?._id && token) {
      checkFreeTrialUsage();
    }
  }, [user, token, router]);

  // Prevent tab switching and navigation
  useEffect(() => {
    if (!interviewStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        setWarningMessage(`Warning: Tab switching detected! This is attempt ${tabSwitchCount + 1}. Your interview may be terminated.`);
        setShowWarning(true);
        
        if (tabSwitchCount >= 2) {
          setWarningMessage('Interview terminated due to multiple tab switches. This violates interview guidelines.');
          setShowWarning(true);
          setTimeout(() => {
            handleEndInterview();
          }, 2000);
        }
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave the interview? Your progress will be lost.';
      return e.returnValue;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) && 
        (e.key === 't' || e.key === 'n' || e.key === 'w' || e.key === 'r' || 
         e.key === 'Tab' || e.key === 'F12' || e.key === 'I')
      ) {
        e.preventDefault();
        setWarningMessage('Keyboard shortcuts are disabled during the interview.');
        setShowWarning(true);
      }
      
      if (e.key.startsWith('F') && e.key !== 'F5') {
        e.preventDefault();
        setWarningMessage('Function keys are disabled during the interview.');
        setShowWarning(true);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setWarningMessage('Right-click is disabled during the interview.');
      setShowWarning(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [interviewStarted, tabSwitchCount]);

  // Enter fullscreen when interview starts
  useEffect(() => {
    if (interviewStarted && !isFullscreen) {
      const enterFullscreen = async () => {
        try {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        } catch (error) {
          console.error('Failed to enter fullscreen:', error);
          setWarningMessage('Please enable fullscreen mode for the interview.');
          setShowWarning(true);
        }
      };
      enterFullscreen();
    }
  }, [interviewStarted, isFullscreen]);

  // Handle fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && interviewStarted) {
        setWarningMessage('Fullscreen mode is required during the interview.');
        setShowWarning(true);
        setTimeout(() => {
          document.documentElement.requestFullscreen().catch(console.error);
        }, 1000);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [interviewStarted]);

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

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupMediaStreams();
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
    };
  }, [cleanupMediaStreams]);

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
    try {
      const initPayload = {
        user: {
          id: user?._id || 'demo-user',
          name: user?.name || 'Demo User',
          email: user?.email || 'demo@example.com',
          role: 'user',
          experience: user?.experience || '3 years in software development',
          skills: user?.tech_stack ? user.tech_stack.split(',') : ['JavaScript', 'React', 'Node.js'],
          goals: user?.goals || 'Improve interview skills',
          education: user?.education ? [user.education] : [],
          workExperience: [],
          profileCompletion: user?.profile_completion || 75
        },
        configuration: {
          level: level || 'intermediate',
          category: category || 'fullstack',
          duration: parseInt(duration || '30') * 60,
          language: 'javascript',
          hasCodeEditor: hasCodeEditor,
          isFreeInterview: true
        },
        context: {
          sessionId: `session_${Date.now()}_${user?._id}`,
          startTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      const response = await fetch(`${API_URL}/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(initPayload)
      });

      const data = await response.json();
      
      if (data.success && data.sessionId) {
        setSessionId(data.sessionId);
        setInterviewStarted(true);
        setIsAISpeaking(true);
        
        if (data.firstQuestion) {
          setCurrentQuestion(data.firstQuestion.question);
          setCurrentQuestionId(data.firstQuestion.id);
          
          const aiMessage = {
            id: Date.now().toString(),
            type: 'ai' as const,
            content: data.message + '\n\n' + data.firstQuestion.question,
            timestamp: new Date()
          };
          setMessages([aiMessage]);
        }
        
        fetchConversationHistory(data.sessionId);
        
        setTimeout(() => {
          setIsAISpeaking(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      setWarningMessage('Failed to start interview. Please try again.');
      setShowWarning(true);
    }
  };

  const fetchConversationHistory = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_URL}/interview/conversation/history/${sessionId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.conversations) {
          const historyMessages = data.conversations.map((conv: any) => ({
            id: `${conv.timestamp}_${conv.sender}`,
            type: conv.sender,
            content: conv.message,
            timestamp: new Date(conv.timestamp)
          }));
          setMessages(prev => [...historyMessages, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversation history:', error);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !sessionId) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = userInput;
    setUserInput('');
    setIsAISpeaking(true);

    try {
      const payload = {
        sessionId,
        message: messageToSend,
        responseTime: 5,
        metadata: {
          userAgent: navigator.userAgent,
          deviceType: 'desktop'
        }
      };

      const response = await fetch(`${API_URL}/interview/conversation/enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success && data.aiResponse) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai' as const,
          content: data.aiResponse,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        
        if (data.currentQuestion) {
          setCurrentQuestion(data.currentQuestion);
        }
        
        if (data.progress) {
          setProgress(data.progress);
        }
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
    if (!code.trim() || !sessionId) return;

    try {
      const payload = {
        sessionId,
        message: "Here's my solution to the coding question",
        questionId: currentQuestionId,
        codeContext: {
          questionId: currentQuestionId,
          code,
          language,
          isCodeSubmission: true
        },
        responseTime: 300
      };

      const response = await fetch(`${API_URL}/interview/conversation/enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        const codeResultMessage = {
          id: Date.now().toString(),
          type: 'ai' as const,
          content: data.aiResponse || 'Code executed successfully!',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, codeResultMessage]);
        
        if (data.progress) {
          setProgress(data.progress);
        }
      }
    } catch (error) {
      console.error('Error executing code:', error);
      const errorMessage = {
        id: Date.now().toString(),
        type: 'ai' as const,
        content: 'Error executing code. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleEndInterview = async () => {
    try {
      if (sessionId) {
        const payload = {
          sessionId,
          feedback: "Interview completed successfully"
        };

        await fetch(`${API_URL}/interview/end`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify(payload)
        });
      }
    } catch (error) {
      console.error('Error ending interview:', error);
    }

    cleanupMediaStreams();
    
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
      }
    }
    
    setInterviewStarted(false);
    setIsFullscreen(false);
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
      
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="glass-card p-6 lg:p-8 max-w-md text-center border-2 border-red-500/50">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg lg:text-xl font-bold mb-4 text-red-400">Interview Warning</h3>
            <p className="text-gray-300 mb-6 text-sm lg:text-base">{warningMessage}</p>
            <button
              onClick={() => setShowWarning(false)}
              className="btn-primary px-4 lg:px-6 py-2 text-sm lg:text-base"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Mobile Code Editor Overlay */}
      {showMobileCodeEditor && hasCodeEditor && (
        <div className="fixed inset-0 bg-black z-50 lg:hidden">
          <div className="flex flex-col h-full">
            <div className="bg-[#0A0A0A] border-b border-[#00FFB2]/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Code size={20} className="text-[#00FFB2]" />
                  <span className="font-semibold text-sm">Code Editor</span>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-[#1A1A1A] border border-gray-600 rounded px-2 py-1 text-xs"
                  >
                    {getLanguageOptions().map(lang => (
                      <option key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={runCode}
                    className="btn-primary px-3 py-1 text-xs flex items-center space-x-1"
                  >
                    <Terminal size={12} />
                    <span>Run</span>
                  </button>
                  <button
                    onClick={() => setShowMobileCodeEditor(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={20} />
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
        </div>
      )}

      <div className="pt-16">
        {/* Header Bar */}
        <div className="bg-[#0A0A0A] border-b border-[#00FFB2]/20 px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-0">
            <div className="flex flex-wrap items-center gap-3 lg:gap-4">
              <div className="flex items-center space-x-2">
                <Clock size={20} className="text-[#00FFB2]" />
                <span className="font-mono text-base lg:text-lg">{formatTime(timeRemaining)}</span>
              </div>
              <div className="text-xs lg:text-sm text-gray-400">
                {category?.toUpperCase()} • {level?.toUpperCase()} Level
              </div>
              {tabSwitchCount > 0 && (
                <div className="text-xs lg:text-sm text-red-400">
                  Tab Switches: {tabSwitchCount}/3
                </div>
              )}
              <div className="text-xs lg:text-sm text-[#00FFB2]">
                Progress: {progress.questionsAnswered}/{progress.totalQuestions}
              </div>
            </div>
            
            <div className="flex items-center justify-center lg:justify-end space-x-2 lg:space-x-4">
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
              
              {hasCodeEditor && (
                <button
                  onClick={() => setShowMobileCodeEditor(true)}
                  className="lg:hidden bg-[#00FFB2]/20 text-[#00FFB2] p-2 rounded-full"
                >
                  <Code size={16} />
                </button>
              )}
              
              <button
                onClick={handleEndInterview}
                className="bg-red-500 hover:bg-red-600 text-white px-3 lg:px-4 py-2 rounded-lg flex items-center space-x-1 lg:space-x-2 text-sm lg:text-base"
              >
                <Phone size={16} />
                <span className="hidden sm:inline">End Interview</span>
                <span className="sm:hidden">End</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)]">
          {/* Left Panel - Video and Chat */}
          <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-[#00FFB2]/20">
            {/* Video Section */}
            <div className="h-48 lg:h-1/2 bg-[#0A0A0A] p-2 lg:p-4">
              <div className="grid grid-cols-2 gap-2 lg:gap-4 h-full">
                {/* User Video */}
                <div className="bg-[#111] rounded-lg overflow-hidden relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 lg:bottom-2 left-1 lg:left-2 bg-black/50 px-1 lg:px-2 py-0.5 lg:py-1 rounded text-xs lg:text-sm">
                    You
                  </div>
                </div>
                
                {/* AI Avatar */}
                <div className="bg-[#111] rounded-lg overflow-hidden relative">
                  <AIAvatar isActive={isAISpeaking} />
                  <div className="absolute bottom-1 lg:bottom-2 left-1 lg:left-2 bg-black/50 px-1 lg:px-2 py-0.5 lg:py-1 rounded text-xs lg:text-sm">
                    AI Interviewer
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Section */}
            <div className="flex-1 flex flex-col bg-[#0A0A0A]">
              <div className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-2 lg:space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] lg:max-w-[80%] p-2 lg:p-3 rounded-lg text-sm lg:text-base ${
                      message.type === 'user' 
                        ? 'bg-[#00FFB2] text-black' 
                        : 'bg-[#1A1A1A] text-white'
                    }`}>
                      <div className="flex items-center space-x-1 lg:space-x-2 mb-1">
                        {message.type === 'user' ? (
                          <User size={16} />
                        ) : (
                          <Bot size={16} className="text-[#00FFB2]" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap text-xs lg:text-sm">{message.content}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="p-2 lg:p-4 border-t border-[#00FFB2]/20">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your response..."
                    className="flex-1 bg-[#1A1A1A] border border-gray-600 rounded-lg px-3 lg:px-4 py-2 text-white text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-[#00FFB2]"
                    disabled={!interviewStarted || isAISpeaking}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!interviewStarted || isAISpeaking || !userInput.trim()}
                    className="btn-primary px-3 lg:px-4 py-2 disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Code Editor (Desktop) or Info Panel */}
          {hasCodeEditor ? (
            <div className="hidden lg:flex lg:w-1/2 flex-col">
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
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-[#0A0A0A]">
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card p-6 lg:p-8 text-center max-w-md">
              <h2 className="text-xl lg:text-2xl font-bold mb-4">Ready to Start?</h2>
              <p className="text-gray-400 mb-6 text-sm lg:text-base">
                Your {category} interview at {level} level is about to begin. 
                Duration: {duration} minutes.
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 lg:p-4 mb-6">
                <p className="text-yellow-400 text-xs lg:text-sm">
                  <strong>Important:</strong> This interview will be in fullscreen mode. 
                  Tab switching is monitored and limited to 3 attempts.
                </p>
              </div>
              <button
                onClick={startInterview}
                className="btn-primary px-6 lg:px-8 py-2.5 lg:py-3 text-base lg:text-lg flex items-center justify-center mx-auto"
              >
                <Play className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
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
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFB2] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading interview session...</p>
        </div>
      </div>
    }>
      <InterviewSessionContent />
    </Suspense>
  );
}