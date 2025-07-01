'use client';

import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  MessageSquare
} from 'lucide-react';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function ScorecardPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Sidebar userType="learner" />

      <div className="ml-64 pt-20 pb-12">
        <div className="container-custom space-y-10">
          {/* Page Title */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Interview <span className="gradient-text">Scorecard</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Detailed analysis of your latest interview performance
            </p>
          </div>

          {/* Overall Score */}
          <div className="glass-card text-center p-8">
            <div className="mb-6">
              <div className="text-6xl font-bold neon-text mb-2">85%</div>
              <div className="text-xl text-gray-400">Overall Score</div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-[#00FFB2] mb-1">92%</div>
                <div className="text-sm text-gray-400">Technical Skills</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500 mb-1">78%</div>
                <div className="text-sm text-gray-400">Communication</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#00FFB2] mb-1">85%</div>
                <div className="text-sm text-gray-400">Problem Solving</div>
              </div>
            </div>
          </div>

          {/* Skills + Insights */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Skills Analysis */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6">Skills Analysis</h2>
              <div className="space-y-6">
                {[
                  {
                    label: 'JavaScript Proficiency',
                    score: '92%',
                    color: 'text-[#00FFB2]',
                    bar: 'w-11/12',
                    icon: <TrendingUp className="h-4 w-4 text-green-500" />
                  },
                  {
                    label: 'System Design',
                    score: '78%',
                    color: 'text-yellow-500',
                    bar: 'w-3/4',
                    icon: <TrendingDown className="h-4 w-4 text-red-500" />
                  },
                  {
                    label: 'Data Structures',
                    score: '88%',
                    color: 'text-[#00FFB2]',
                    bar: 'w-5/6',
                    icon: <TrendingUp className="h-4 w-4 text-green-500" />
                  },
                  {
                    label: 'Communication',
                    score: '74%',
                    color: 'text-yellow-500',
                    bar: 'w-3/4',
                    icon: <TrendingDown className="h-4 w-4 text-red-500" />
                  }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{item.label}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`${item.color}`}>{item.score}</span>
                        {item.icon}
                      </div>
                    </div>
                    <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                      <div className={`h-2 rounded-full bg-accent ${item.bar}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Insights */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6">Key Insights</h2>
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Target className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-400 mb-1">Strengths</div>
                      <p className="text-sm text-gray-400">
                        Excellent problem-solving approach and clean code implementation. Strong understanding of JavaScript fundamentals.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Brain className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-400 mb-1">Areas to Improve</div>
                      <p className="text-sm text-gray-400">
                        Work on explaining your thought process more clearly. Practice system design concepts for large-scale applications.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-400 mb-1">Recommendations</div>
                      <p className="text-sm text-gray-400">
                        Schedule a session with a system design mentor. Practice mock interviews focusing on communication skills.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6">Next Steps</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-[#111] rounded-lg">
                <h3 className="font-semibold mb-3">Find a Mentor</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Connect with a system design expert to improve your architecture skills
                </p>
                <button className="btn-primary w-full flex items-center justify-center">
                  Browse Mentors <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>

              <div className="p-6 bg-[#111] rounded-lg">
                <h3 className="font-semibold mb-3">Practice More</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Take another interview to track your improvement over time
                </p>
                <button className="btn-secondary w-full flex items-center justify-center">
                  Start New Interview <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
