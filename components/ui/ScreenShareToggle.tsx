'use client';

import { ScreenShare } from 'lucide-react';
import { useState } from 'react';

type Props = {
  onStart: (stream: MediaStream) => void;
  onStop: () => void;
};

export default function ScreenShareToggle({ onStart, onStop }: Props) {
  const [isSharing, setIsSharing] = useState(false);

  const toggleScreenShare = async () => {
    if (!isSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setIsSharing(true);
        onStart(stream);
      } catch (err) {
        console.error('Screen sharing failed:', err);
      }
    } else {
      setIsSharing(false);
      onStop();
    }
  };

  return (
    <button
      onClick={toggleScreenShare}
      className={`p-4 rounded-full bg-[#1A1A1A] hover:bg-[#00FFB2]/10 border border-[#333] text-[#00FFB2] ${
        isSharing ? 'ring-2 ring-[#00FFB2]' : ''
      }`}
      title="Toggle Screen Share"
    >
      <ScreenShare className="h-5 w-5" />
    </button>
  );
}
