'use client';

import { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Mic, MicOff, Video, VideoOff, ScreenShare, MoreVertical } from 'lucide-react';

export default function InterviewCall() {
  const videoRef = useRef(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    async function getCameraStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Camera access denied:', error);
        setPermissionDenied(true);
      }
    }

    getCameraStream();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Sidebar userType="learner" />

      <div className="ml-64 pt-20 pb-12">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-6">Interview Call</h1>

          {permissionDenied ? (
            <div className="text-red-500">Camera access was denied. Please enable it to continue.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Camera Feed */}
                <div className="bg-[#111] rounded-xl p-4 shadow-lg text-center">
                  <h2 className="text-lg font-semibold mb-2">You</h2>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="rounded-lg w-full aspect-video object-cover border border-gray-700"
                  />
                </div>

                {/* AI Interviewer Image */}
                <div className="bg-[#111] rounded-xl p-4 shadow-lg text-center">
                  <h2 className="text-lg font-semibold mb-2">AI Interviewer</h2>
                  <img
                    src="https://img.freepik.com/premium-photo/portrait-professional-woman-suit-business-woman-standing-office-generative-ai_868783-4132.jpg"
                    alt="AI Interviewer"
                    className="rounded-lg w-full aspect-video object-cover border border-gray-700"
                  />
                </div>
              </div>

              {/* Control Panel */}
              <div className="flex justify-center items-center mt-10 gap-6">
                <button className="p-4 rounded-full bg-[#1A1A1A] hover:bg-[#00FFB2]/10 border border-[#333] text-[#00FFB2]">
                  <Mic className="h-5 w-5" />
                </button>
                <button className="p-4 rounded-full bg-[#1A1A1A] hover:bg-[#00FFB2]/10 border border-[#333] text-[#00FFB2]">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-4 rounded-full bg-[#1A1A1A] hover:bg-[#00FFB2]/10 border border-[#333] text-[#00FFB2]">
                  <ScreenShare className="h-5 w-5" />
                </button>
                <button className="p-4 rounded-full bg-[#1A1A1A] hover:bg-[#00FFB2]/10 border border-[#333] text-[#00FFB2]">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
