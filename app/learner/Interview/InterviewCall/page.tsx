"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ScreenShareToggle from "@/components/ui/ScreenShareToggle";
import { Mic, MicOff, Video, VideoOff, MoreVertical } from "lucide-react";

export default function InterviewCall() {
  const videoRef = useRef<HTMLVideoElement>(null); // User cam
  const screenRef = useRef<HTMLVideoElement>(null); // Screen share
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [videoTracks, setVideoTracks] = useState<MediaStreamTrack[]>([]);

  const startScreenShare = (stream: MediaStream) => {
    setIsScreenSharing(true);

    if (screenRef.current) {
      screenRef.current.srcObject = stream;

      screenRef.current.onloadedmetadata = () => {
        screenRef.current?.play().catch((err) => {
          console.error("Screen playback failed:", err);
        });
      };
    }

    // Stop sharing when user ends from browser UI
    stream.getVideoTracks()[0].addEventListener("ended", () => {
      stopScreenShare();
    });
  };

  const stopScreenShare = () => {
    setIsScreenSharing(false);
    if (screenRef.current?.srcObject) {
      const stream = screenRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      screenRef.current.srcObject = null;
    }
  };

  // Initial camera/mic access
  useEffect(() => {
    async function getMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMediaStream(stream);
        setVideoTracks(stream.getVideoTracks());

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setPermissionDenied(true);
      }
    }

    getMedia();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = isMicOn;
      });
    }
  }, [isMicOn, mediaStream]);

  useEffect(() => {
    if (!isCameraOn) {
      if (mediaStream) {
        mediaStream.getVideoTracks().forEach((track) => {
          track.stop(); // Stop camera and turn off flash
          mediaStream.removeTrack(track);
        });
      }

      if (videoRef.current && !isScreenSharing) {
        videoRef.current.srcObject = null;
      }

      const audioTracks = mediaStream?.getAudioTracks() || [];
      if (audioTracks.length > 0) {
        const audioOnly = new MediaStream(audioTracks);
        setMediaStream(audioOnly);
      } else {
        setMediaStream(null);
      }

      setVideoTracks([]);
    } else {
      async function restartCamera() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          const newVideoTracks = stream.getVideoTracks();
          setVideoTracks(newVideoTracks);

          const combinedStream = new MediaStream([
            ...(mediaStream?.getAudioTracks() || []),
            ...newVideoTracks,
          ]);

          if (videoRef.current && !isScreenSharing) {
            videoRef.current.srcObject = combinedStream;
          }

          setMediaStream(combinedStream);
        } catch (err) {
          console.error("Failed to restart camera:", err);
        }
      }

      restartCamera();
    }
  }, [isCameraOn]);

  const toggleMic = () => setIsMicOn((prev) => !prev);
  const toggleCamera = () => setIsCameraOn((prev) => !prev);

  return (
    <div className="min-h-screen bg-black relative">
      <Navbar />
      <Sidebar userType="learner" />

      <div className="ml-64 pt-20 pb-12 relative">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-6 text-white">Interview Call</h1>

          {permissionDenied ? (
            <div className="text-red-500">
              Camera access was denied. Please enable it to continue.
            </div>
          ) : (
            <>
              {/* Screen share main box */}
              {isScreenSharing ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-700 shadow-xl">
                  <video
                    key={isScreenSharing ? "screen" : "none"}
                    ref={screenRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Floating bottom-right tiles */}
                  <div className="absolute bottom-4 right-4 flex flex-col gap-4 w-48">
                    <div className="bg-[#111] rounded-lg overflow-hidden border border-gray-600">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full aspect-video object-cover"
                      />
                    </div>
                    <div className="bg-[#111] rounded-lg overflow-hidden border border-gray-600">
                      <img
                        src="https://img.freepik.com/premium-photo/portrait-professional-woman-suit-business-woman-standing-office-generative-ai_868783-4132.jpg"
                        alt="AI Interviewer"
                        className="w-full aspect-video object-cover"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Show camera & AI side by side
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-[#111] rounded-xl p-4 shadow-lg text-center">
                    <h2 className="text-lg font-semibold mb-2 text-white">
                      You
                    </h2>
                    {!isCameraOn ? (
                      <div className="w-full aspect-video bg-[#0f172a] rounded-lg flex items-center justify-center text-gray-400">
                        Camera is Off
                      </div>
                    ) : (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="rounded-lg w-full aspect-video object-cover border border-gray-700"
                      />
                    )}
                  </div>

                  <div className="bg-[#111] rounded-xl p-4 shadow-lg text-center">
                    <h2 className="text-lg font-semibold mb-2 text-white">
                      AI Interviewer
                    </h2>
                    <img
                      src="https://img.freepik.com/premium-photo/portrait-professional-woman-suit-business-woman-standing-office-generative-ai_868783-4132.jpg"
                      alt="AI Interviewer"
                      className="rounded-lg w-full aspect-video object-cover border border-gray-700"
                    />
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-center items-center mt-10 gap-6">
                <button
                  onClick={toggleMic}
                  className="p-4 rounded-full bg-[#1A1A1A] hover:bg-[#00FFB2]/10 border border-[#333] text-[#00FFB2]"
                >
                  {isMicOn ? (
                    <Mic className="h-5 w-5" />
                  ) : (
                    <MicOff className="h-5 w-5" />
                  )}
                </button>

                <button
                  onClick={toggleCamera}
                  className="p-4 rounded-full bg-[#1A1A1A] hover:bg-[#00FFB2]/10 border border-[#333] text-[#00FFB2]"
                >
                  {isCameraOn ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <VideoOff className="h-5 w-5" />
                  )}
                </button>

                <ScreenShareToggle
                  onStart={startScreenShare}
                  onStop={stopScreenShare}
                />

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
