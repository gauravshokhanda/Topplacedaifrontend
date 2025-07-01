'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function InterviewPage() {
  const router = useRouter();
  const [selectedAvatar, setSelectedAvatar] = useState('female');
  const [interviewType, setInterviewType] = useState('technical');

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Sidebar userType="learner" />

      <div className="ml-64 pt-20 pb-12">
        <div className="container-custom space-y-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              Start Your <span className="gradient-text">AI Mock Interview</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Select your preferences and get instant AI feedback
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Interviewer Card */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Choose Your Interviewer</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'female', name: 'Sarah', role: 'Senior HR Manager', emoji: '👩‍💼' },
                  { id: 'male', name: 'Alex', role: 'Tech Lead', emoji: '👨‍💼' },
                ].map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      selectedAvatar === avatar.id
                        ? 'border-[#00FFB2] bg-[#00FFB2]/10'
                        : 'border-[#333] hover:border-[#00FFB2]/50'
                    }`}
                  >
                    <div className="w-16 h-16 bg-[#00FFB2] rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
                      {avatar.emoji}
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{avatar.name}</div>
                      <div className="text-sm text-gray-400">{avatar.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Interview Type */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Interview Type</h2>
              <div className="space-y-3">
                {[
                  { id: 'technical', label: 'Technical Interview', desc: 'Coding and system design questions' },
                  { id: 'behavioral', label: 'Behavioral Interview', desc: 'Soft skills and situational prompts' },
                  { id: 'case-study', label: 'Case Study', desc: 'Problem-solving with real-world scenarios' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setInterviewType(type.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      interviewType === type.id
                        ? 'border-[#00FFB2] bg-[#00FFB2]/10'
                        : 'border-[#333] hover:border-[#00FFB2]/50'
                    }`}
                  >
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-gray-400">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card text-center py-10">
            <h3 className="text-xl font-semibold mb-4">Ready to Begin?</h3>
            <p className="text-gray-400 mb-6">
              Ensure you are in a quiet space — your responses will be analyzed live.
            </p>
            <button
              onClick={() => router.push('/learner/Interview/InterviewCall')}
              className="btn-primary px-8 py-4 text-lg flex items-center justify-center mx-auto"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
