'use client';

import { useEffect, useState } from 'react';
import { Bot, Mic } from 'lucide-react';

interface AIAvatarProps {
  isActive: boolean;
}

export default function AIAvatar({ isActive }: AIAvatarProps) {
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 4);
    }, 200);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#00FFB2]/20 to-[#00CC8E]/20 flex items-center justify-center relative overflow-hidden">
      {/* Background Animation */}
      <div className={`absolute inset-0 bg-gradient-to-r from-[#00FFB2]/10 to-[#00CC8E]/10 transition-opacity duration-300 ${
        isActive ? 'opacity-100' : 'opacity-50'
      }`}>
        <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-[#00FFB2]/5 to-transparent transform transition-transform duration-1000 ${
          isActive ? 'scale-110 rotate-1' : 'scale-100 rotate-0'
        }`} />
      </div>

      {/* AI Avatar */}
      <div className={`relative z-10 transition-all duration-300 ${
        isActive ? 'scale-110' : 'scale-100'
      }`}>
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-[#00FFB2] to-[#00CC8E] flex items-center justify-center transition-all duration-200 ${
          isActive ? 'shadow-lg shadow-[#00FFB2]/50' : ''
        }`}>
          <Bot size={40} className="text-black" />
        </div>
        
        {/* Speaking Indicator */}
        {isActive && (
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#00FFB2] rounded-full flex items-center justify-center animate-pulse">
            <Mic size={16} className="text-black" />
          </div>
        )}
      </div>

      {/* Sound Waves Animation */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-32 h-32 border-2 border-[#00FFB2]/30 rounded-full animate-ping`}
              style={{
                animationDelay: `${i * 0.5}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      )}

      {/* Status Text */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <div className={`text-sm font-medium transition-colors duration-300 ${
          isActive ? 'text-[#00FFB2]' : 'text-gray-400'
        }`}>
          {isActive ? 'Speaking...' : 'Listening'}
        </div>
      </div>
    </div>
  );
}