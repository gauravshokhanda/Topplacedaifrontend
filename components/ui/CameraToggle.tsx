'use client';

import { Video, VideoOff } from 'lucide-react';

type Props = {
  isCameraOn: boolean;
  toggleCamera: () => void;
};

export default function CameraToggle({ isCameraOn, toggleCamera }: Props) {
  return (
    <button
      onClick={toggleCamera}
      className="p-4 rounded-full bg-[#1A1A1A] hover:bg-[#00FFB2]/10 border border-[#333] text-[#00FFB2]"
      title="Toggle Camera"
    >
      {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
    </button>
  );
}
