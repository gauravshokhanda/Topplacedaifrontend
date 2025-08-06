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

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showMobileCodeEditor, setShowMobileCodeEditor] = useState(false);
  const [progress, setProgress] = useState({
    questionsAnswered: 0,
    totalQuestions: 6,
    completionPercentage: 0
  });

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  
  // Text-to-speech state
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

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

  const requestInitialPermissions = async () => {
    try {
      console.log('🎤 Requesting permission...');
      
      // Request permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      const audioTracks = stream.getAudioTracks();
      const videoTracks = stream.getVideoTracks();
      
      console.log('✅ Permission granted');
      console.log('🎙️ Audio:', audioTracks[0]?.label);
      console.log('📷 Video:', videoTracks[0]?.label);
      
      // Set the stream and update states
      setMediaStream(stream);
      
      if (videoTracks.length > 0 && videoTracks[0].enabled) {
        setIsCameraOn(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        console.log('✅ Camera enabled');
      }
      
      if (audioTracks.length > 0 && audioTracks[0].enabled) {
        setIsMicOn(true);
        console.log('✅ Microphone enabled');
        
        // Initialize MediaRecorder with robust codec detection
        try {
          const recorder = await createRobustMediaRecorder(stream);
          setMediaRecorder(recorder);
          console.log('✅ MediaRecorder initialized successfully with robust method');
        } catch (recorderError) {
          console.error('Failed to initialize MediaRecorder:', recorderError);
          setWarningMessage('Voice recording setup failed. Your browser may not support audio recording.');
          setShowWarning(true);
        }
      }
      
      setPermissionGranted(true);
      setShowPermissionRequest(false); // hide overlay
      console.log('✅ Initial permission setup completed');
      
    } catch (error: any) {
      console.error('❌ getUserMedia failed', error);
      
      setPermissionGranted(false);
      setIsCameraOn(false);
      setIsMicOn(false);
      
      // If user blocks it, show retry overlay
      if (error.name === 'NotAllowedError') {
        setWarningMessage('Microphone and Camera access was denied. Please allow permissions to continue with the interview.');
        setShowWarning(true);
        setShowPermissionRequest(true); // show retry overlay
      } else if (error.name === 'NotFoundError') {
        setWarningMessage('No camera or microphone found. Please connect your devices and refresh the page.');
        setShowWarning(true);
        setShowPermissionRequest(true);
      } else if (error.name === 'NotReadableError') {
        setWarningMessage('Camera or microphone is already in use by another application. Please close other applications and try again.');
        setShowWarning(true);
        setShowPermissionRequest(true);
      } else {
        setWarningMessage('Unable to access camera and microphone. Please check your browser settings and try again.');
        setShowWarning(true);
        setShowPermissionRequest(true);
      }
    }
  };

  const checkAndRefreshPermissions = async () => {
    try {
      console.log('🔄 Checking and refreshing permissions...');
      console.log('Current states before refresh:', { isCameraOn, isMicOn, hasMediaStream: !!mediaStream });
      
      // First, try to get media directly (this will show the permission prompt if needed)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      console.log('✅ Got media stream successfully');
      console.log('Stream details:', {
        id: stream.id,
        active: stream.active,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      });
      
      // Clean up existing streams
      cleanupMediaStreams();
      
      // Set the new stream
      setMediaStream(stream);
      
      // Check what tracks we actually got
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      
      console.log(`📹 Video tracks: ${videoTracks.length}`);
      console.log(`🎤 Audio tracks: ${audioTracks.length}`);
      
      if (audioTracks.length > 0) {
        console.log('Audio track details:', {
          id: audioTracks[0].id,
          kind: audioTracks[0].kind,
          label: audioTracks[0].label,
          enabled: audioTracks[0].enabled,
          muted: audioTracks[0].muted,
          readyState: audioTracks[0].readyState
        });
      }
      
      // Update states based on actual tracks
      if (videoTracks.length > 0 && videoTracks[0].enabled) {
        setIsCameraOn(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        console.log('✅ Camera enabled');
      } else {
        setIsCameraOn(false);
        console.log('❌ Camera not available');
      }
      
      if (audioTracks.length > 0 && audioTracks[0].enabled) {
        console.log('✅ Microphone enabled - setting state to true');
        setIsMicOn(true);
        
        // Re-initialize MediaRecorder with robust codec detection
        try {
          const recorder = await createRobustMediaRecorder(stream);
          setMediaRecorder(recorder);
          console.log('✅ MediaRecorder re-initialized successfully with robust method');
          console.log('MediaRecorder state:', recorder.state);
        } catch (recorderError) {
          console.error('Failed to re-initialize MediaRecorder:', recorderError);
          setWarningMessage('Voice recording setup failed. Your browser may not support audio recording.');
          setShowWarning(true);
        }
      } else {
        setIsMicOn(false);
        console.log('❌ Microphone not available - setting state to false');
      }
      
      console.log('Final states after refresh:', { 
        isCameraOn: videoTracks.length > 0 && videoTracks[0].enabled, 
        isMicOn: audioTracks.length > 0 && audioTracks[0].enabled 
      });
      console.log('✅ Permission refresh completed');
      
      // Force a small delay to ensure state updates are processed
      setTimeout(() => {
        console.log('State check after timeout:', { isCameraOn, isMicOn });
      }, 100);
      
    } catch (error) {
      console.error('Error refreshing permissions:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        constraint: error.constraint
      });
      setIsCameraOn(false);
      setIsMicOn(false);
      setWarningMessage('Unable to access camera and microphone. Please allow permissions and try again.');
      setShowWarning(true);
    }
  };

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

  // Fullscreen disabled for testing
  // useEffect(() => {
  //   if (interviewStarted && !isFullscreen) {
  //     const enterFullscreen = async () => {
  //       try {
  //         await document.documentElement.requestFullscreen();
  //         setIsFullscreen(true);
  //       } catch (error) {
  //         console.error('Failed to enter fullscreen:', error);
  //         setWarningMessage('Please enable fullscreen mode for the interview.');
  //         setShowWarning(true);
  //       }
  //     };
  //     enterFullscreen();
  //   }
  // }, [interviewStarted, isFullscreen]);

  // // Handle fullscreen exit
  // useEffect(() => {
  //   const handleFullscreenChange = () => {
  //     if (!document.fullscreenElement && interviewStarted) {
  //       setWarningMessage('Fullscreen mode is required during the interview.');
  //       setShowWarning(true);
  //       setTimeout(() => {
  //         document.documentElement.requestFullscreen().catch(console.error);
  //       }, 1000);
  //     }
  //   };

  //   document.addEventListener('fullscreenchange', handleFullscreenChange);
  //   return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  // }, [interviewStarted]);

  // Automatically request permissions on mount
  useEffect(() => {
    if (!mediaStream && !permissionGranted) {
      console.log('🚀 Auto-requesting permissions on mount...');
      requestInitialPermissions();
    }
  }, [mediaStream, permissionGranted]);

  // Initialize text-to-speech
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
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
      stopSpeaking();
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

  // Enhanced MediaRecorder creation with comprehensive testing
  const createRobustMediaRecorder = async (stream) => {
    console.log('🎙️ Creating robust MediaRecorder...');
    
    // Comprehensive list of audio formats to try, ordered by preference
    const audioFormats = [
      // WebM formats (most widely supported)
      'audio/webm;codecs=opus',
      'audio/webm;codecs=vp8,opus',
      'audio/webm',
      
      // MP4 formats
      'audio/mp4;codecs=mp4a.40.2',
      'audio/mp4;codecs=aac',
      'audio/mp4',
      
      // OGG formats
      'audio/ogg;codecs=opus',
      'audio/ogg;codecs=vorbis',
      'audio/ogg',
      
      // WAV format (fallback)
      'audio/wav',
      'audio/wave',
      
      // Basic formats without codecs
      'audio/mpeg',
      'audio/aac'
    ];
    
    let selectedFormat = null;
    let recorder = null;
    
    // Test each format thoroughly
    for (const format of audioFormats) {
      try {
        console.log(`🧪 Testing format: ${format}`);
        
        if (MediaRecorder.isTypeSupported(format)) {
          console.log(`✅ Format supported by browser: ${format}`);
          
          // Try to create a MediaRecorder with this format
          const testRecorder = new MediaRecorder(stream, { 
            mimeType: format,
            audioBitsPerSecond: 128000 // Standard bitrate
          });
          
          // Test if we can actually start/stop it
          let testPassed = false;
          
          testRecorder.ondataavailable = () => {
            console.log(`📦 Test data received for format: ${format}`);
          };
          
          testRecorder.onstop = () => {
            console.log(`🛑 Test recording stopped for format: ${format}`);
            testPassed = true;
          };
          
          testRecorder.onerror = (event) => {
            console.error(`❌ Test error for format ${format}:`, event.error);
          };
          
          // Quick test: start and immediately stop
          testRecorder.start();
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
          
          if (testRecorder.state === 'recording') {
            testRecorder.stop();
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait for stop
            
            if (testPassed || testRecorder.state === 'inactive') {
              selectedFormat = format;
              recorder = new MediaRecorder(stream, { mimeType: format });
              console.log(`🎯 Successfully selected and created MediaRecorder with format: ${format}`);
              break;
            }
          }
        } else {
          console.log(`❌ Format not supported: ${format}`);
        }
      } catch (error) {
        console.log(`❌ Error testing format ${format}:`, error.message);
        continue;
      }
    }
    
    // If no format worked with options, try without specifying mimeType
    if (!recorder) {
      try {
        console.log('🔄 Trying MediaRecorder without mimeType specification...');
        recorder = new MediaRecorder(stream);
        selectedFormat = 'default';
        console.log('✅ MediaRecorder created with default settings');
      } catch (error) {
        console.error('❌ Failed to create MediaRecorder even with default settings:', error);
        throw new Error('MediaRecorder is not supported in this browser');
      }
    }
    
    // Set up event handlers for the final recorder
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        console.log(`📦 Audio chunk received: ${event.data.size} bytes`);
        setAudioChunks(prev => [...prev, event.data]);
      }
    };

    recorder.onstop = async () => {
      console.log('🛑 MediaRecorder stopped, processing audio...');
      setIsProcessingVoice(true);
      await processRecordedAudio();
    };

    recorder.onerror = (event) => {
      console.error('❌ MediaRecorder error:', event.error);
      setWarningMessage('Recording error occurred. Please try again.');
      setShowWarning(true);
      setIsRecording(false);
      setIsProcessingVoice(false);
    };

    console.log(`🎉 MediaRecorder initialized successfully with format: ${selectedFormat}`);
    return recorder;
  };

  // Real-time voice recognition - Click to toggle
  const toggleVoiceRecording = async () => {
    if (!speechRecognition) {
      setWarningMessage('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      setShowWarning(true);
      return;
    }

    try {
      if (isRecording) {
        // Stop speech recognition
        console.log('🛑 Stopping speech recognition...');
        speechRecognition.stop();
        setIsRecording(false);
        setIsListening(false);
      } else {
        // Start speech recognition
        console.log('🎤 Starting real-time speech recognition...');
        setTranscribedText(''); // Clear previous text
        setIsRecording(true);
        speechRecognition.start();
      }
    } catch (error) {
      console.error('Error in toggleVoiceRecording:', error);
      setWarningMessage('Error with speech recognition. Please try again.');
      setShowWarning(true);
      setIsRecording(false);
      setIsListening(false);
    }
  };

  // Real-time speech recognition using Web Speech API
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          console.log('🎤 Speech recognition started');
          setIsListening(true);
        };
        
        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            console.log('✅ Final transcript:', finalTranscript);
            setTranscribedText(prev => prev + finalTranscript);
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setWarningMessage('Microphone access denied. Please allow microphone permissions.');
            setShowWarning(true);
          }
        };
        
        recognition.onend = () => {
          console.log('🛑 Speech recognition ended');
          setIsListening(false);
        };
        
        setSpeechRecognition(recognition);
      } else {
        console.warn('Speech recognition not supported in this browser');
      }
    }
  }, []);

  const processRecordedAudio = async () => {
    // This function is now simplified since we use real-time recognition
    setIsProcessingVoice(false);
    setAudioChunks([]);
  };

  const sendTranscribedMessage = async () => {
    if (!transcribedText.trim() || !sessionId) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: transcribedText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsAISpeaking(true);
    setTranscribedText(''); // Clear the transcribed text

    // Send to backend
    await sendVoiceMessage(transcribedText);
  };

  const sendVoiceMessage = async (message: string) => {
    if (!sessionId) return;

    try {
      const payload = {
        sessionId,
        message,
        responseTime: 5,
        metadata: {
          userAgent: navigator.userAgent,
          deviceType: 'desktop',
          inputMethod: 'voice'
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
        
        // Speak the AI response
        speakText(data.aiResponse);
        
        if (data.currentQuestion) {
          setCurrentQuestion(data.currentQuestion);
        }
        
        if (data.progress) {
          setProgress(data.progress);
        }
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
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

  // Text-to-speech functions
  const speakText = (text: string) => {
    if (!speechSynthesis) return;

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Try to use a female voice for AI interviewer
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('samantha')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onstart = () => {
      setIsAISpeaking(true);
    };

    utterance.onend = () => {
      setIsAISpeaking(false);
      setCurrentUtterance(null);
    };

    utterance.onerror = () => {
      setIsAISpeaking(false);
      setCurrentUtterance(null);
    };

    setCurrentUtterance(utterance);
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsAISpeaking(false);
      setCurrentUtterance(null);
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
          interviewType: 'voice',
          questionsLimit: 10,
          aiPersonality: 'professional'
        },
        context: {
          sessionId: `session_${Date.now()}_${user?._id}`,
          startTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          isFreeInterview: true
        },
        preferences: {
          voiceEnabled: true,
          cameraEnabled: isCameraOn,
          microphoneEnabled: isMicOn,
          fullscreenMode: false
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
          
          // Speak the AI response
          speakText(data.message + '. ' + data.firstQuestion.question);
        }
        
        fetchConversationHistory(data.sessionId);
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
              
              <button
                onClick={isAISpeaking ? stopSpeaking : undefined}
                className={`p-2 rounded-full ${isAISpeaking ? 'bg-[#00FFB2]/20 text-[#00FFB2] animate-pulse' : 'bg-gray-500/20 text-gray-400'}`}
                title={isAISpeaking ? "Click to stop AI speech" : "AI speech"}
              >
                <Bot size={20} />
              </button>
              
              {(!isMicOn || !isCameraOn) && (
                <button
                  onClick={checkAndRefreshPermissions}
                  className="p-2 rounded-full bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                  title="Refresh camera and microphone permissions"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 3v5h-5"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                    <path d="M3 21v-5h5"/>
                  </svg>
                </button>
              )}
              
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
              
              {/* Voice Input with Text Display */}
              <div className="p-4 lg:p-6 border-t border-[#00FFB2]/20 bg-[#0A0A0A]">
                {/* Transcribed Text Display */}
                {transcribedText && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your transcribed message:
                    </label>
                    <div className="bg-[#1A1A1A] border border-gray-600 rounded-lg p-3 text-white text-sm lg:text-base">
                      {transcribedText}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center space-x-4">
                  {/* Voice Recording Button */}
                  <button
                    onClick={toggleVoiceRecording}
                    disabled={!interviewStarted || isAISpeaking || !isMicOn || isProcessingVoice}
                    className={`w-16 h-16 lg:w-20 lg:h-20 rounded-full transition-all duration-300 disabled:opacity-50 flex items-center justify-center ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse scale-110 shadow-lg shadow-red-500/50' 
                        : 'bg-[#00FFB2]/20 text-[#00FFB2] hover:bg-[#00FFB2]/30 hover:scale-105 border-2 border-[#00FFB2]/30'
                    }`}
                    title={isRecording ? "Click to stop recording" : "Click to start recording"}
                  >
                    {isProcessingVoice ? (
                      <div className="animate-spin rounded-full h-8 w-8 lg:h-10 lg:w-10 border-b-2 border-current"></div>
                    ) : (
                      <Mic size={32} className="lg:w-10 lg:h-10" />
                    )}
                  </button>

                  {/* Send Button - Only show when there's transcribed text */}
                  {transcribedText && !isRecording && !isProcessingVoice && (
                    <button
                      onClick={sendTranscribedMessage}
                      disabled={!interviewStarted || isAISpeaking}
                      className="bg-[#00FFB2] hover:bg-[#00FFB2]/80 text-black px-6 py-3 rounded-lg flex items-center space-x-2 font-medium disabled:opacity-50"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                      </svg>
                      <span>Send Message</span>
                    </button>
                  )}
                </div>
                
                {/* Voice Instructions */}
                <div className="mt-4 text-center">
                  {!interviewStarted ? (
                    <p className="text-gray-400 text-sm lg:text-base">
                      Start the interview to begin voice interaction
                    </p>
                  ) : isAISpeaking ? (
                    <p className="text-[#00FFB2] text-sm lg:text-base animate-pulse">
                      🤖 AI is speaking... Please listen
                    </p>
                  ) : isRecording && isListening ? (
                    <p className="text-[#00FFB2] text-sm lg:text-base font-medium animate-pulse">
                      🎤 Listening... Speak now (real-time transcription)
                    </p>
                  ) : isRecording && !isListening ? (
                    <p className="text-yellow-400 text-sm lg:text-base font-medium">
                      🎤 Starting speech recognition...
                    </p>
                  ) : !speechRecognition ? (
                    <div className="text-red-400 text-sm lg:text-base">
                      <p>⚠️ Speech recognition not supported</p>
                      <p className="text-xs mt-1">Please use Chrome or Edge browser</p>
                    </div>
                  ) : transcribedText ? (
                    <p className="text-gray-300 text-sm lg:text-base">
                      ✅ Review your message above and click "Send Message" to continue
                    </p>
                  ) : (
                    <p className="text-gray-300 text-sm lg:text-base">
                      🎤 Click the microphone to start speaking (real-time recognition)
                    </p>
                  )}
                </div>
                
                {/* Voice Recording Waveform Animation */}
                {isRecording && (
                  <div className="mt-4 flex justify-center items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-red-400 rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 20 + 10}px`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '0.5s'
                        }}
                      />
                    ))}
                  </div>
                )}
                
                {/* Real-time Speech Recognition Animation */}
                {isRecording && isListening && (
                  <div className="mt-4 flex justify-center items-center space-x-2">
                    <div className="animate-pulse rounded-full h-3 w-3 bg-[#00FFB2]"></div>
                    <span className="text-[#00FFB2] text-sm">Real-time speech recognition active</span>
                  </div>
                )}
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

        {/* Permission Request Overlay */}
        {showPermissionRequest && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card p-6 lg:p-8 text-center max-w-lg">
              <div className="mb-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-[#00FFB2]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#00FFB2]">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold mb-4">Camera & Microphone Access Required</h2>
                <p className="text-gray-400 mb-6 text-sm lg:text-base">
                  To conduct your interview, we need access to your camera and microphone. 
                  This allows you to interact with the AI interviewer through voice and video.
                </p>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-0.5 flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-blue-400 text-sm font-medium mb-1">What we'll use this for:</p>
                    <ul className="text-blue-300 text-xs space-y-1">
                      <li>• Video call with AI interviewer</li>
                      <li>• Voice-to-text transcription</li>
                      <li>• Recording your responses</li>
                      <li>• Real-time interview interaction</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 lg:p-4 mb-6">
                <p className="text-yellow-400 text-xs lg:text-sm">
                  <strong>Privacy Note:</strong> Your camera and microphone data is only used during the interview session and is not stored permanently.
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={requestInitialPermissions}
                  className="w-full bg-[#00FFB2] hover:bg-[#00FFB2]/80 text-black px-6 py-3 rounded-lg flex items-center justify-center space-x-2 font-medium transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                    <path d="M3 12h6m6 0h6"/>
                  </svg>
                  <span>Allow Camera & Microphone</span>
                </button>
                
                <p className="text-gray-500 text-xs">
                   Click "Allow" when your browser asks for permission
                 </p>
                 
                 {showWarning && (
                   <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                     <p className="text-red-400 text-sm">{warningMessage}</p>
                     <button
                       onClick={() => {
                         setShowWarning(false);
                         requestInitialPermissions();
                       }}
                       className="mt-2 text-[#00FFB2] text-sm hover:underline"
                     >
                       Try Again
                     </button>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}

        {/* Start Interview Overlay */}
        {!interviewStarted && !showPermissionRequest && permissionGranted && (
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