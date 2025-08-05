"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Trophy,
  Users,
  TrendingUp,
  Star,
  Calendar,
  ArrowRight,
  Target,
  Award,
  Clock,
  BookOpen,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";

export default function LearnerDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [interviewsCount, setInterviewsCount] = useState(1);
  const [avgScore, setAvgScore] = useState(85);
  const [mentorsCount, setMentorsCount] = useState(2);

  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const recentScores = [
    {
      date: "2024-01-15",
      role: "Software Engineer",
      score: 85,
      improvement: "+12%",
    },
    {
      date: "2024-01-12",
      role: "Product Manager",
      score: 78,
      improvement: "+8%",
    },
    {
      date: "2024-01-10",
      role: "Data Scientist",
      score: 92,
      improvement: "+15%",
    },
  ];

  const recommendedMentors = [
    {
      name: "Sarah Chen",
      role: "Senior Software Engineer",
      company: "Google",
      rating: 4.9,
      price: "$150/hour",
      expertise: ["System Design", "JavaScript", "React"],
      image:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
    },
    {
      name: "Michael Rodriguez",
      role: "VP of Engineering",
      company: "Meta",
      rating: 5.0,
      price: "$200/hour",
      expertise: ["Leadership", "Architecture", "Team Building"],
      image:
        "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
    },
    {
      name: "Dr. Emily Watson",
      role: "AI Research Lead",
      company: "OpenAI",
      rating: 4.8,
      price: "$250/hour",
      expertise: ["Machine Learning", "Python", "Data Science"],
      image:
        "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="lg:block hidden">
          <Sidebar userType="learner" />
        </div>

        <div className="lg:ml-64 ml-0 pt-20 pb-12 px-4 lg:px-0">
          <div className="container-custom">
            {/* Welcome Header */}
            <div
              className={`mb-8 transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                    Welcome back,{" "}
                    <span className="gradient-text">
                      {Users?.name || "John"}
                    </span>
                    ! 👋
                  </h1>
                  <p className="text-gray-400 text-base lg:text-lg">
                    Ready to take your career to the next level?
                  </p>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-4 lg:space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00FFB2]">
                      {interviewsCount}
                    </div>
                    <div className="text-sm text-gray-400">Interviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00FFB2]">
                      {avgScore}%
                    </div>
                    <div className="text-sm text-gray-400">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00FFB2]">
                      {mentorsCount}
                    </div>
                    <div className="text-sm text-gray-400">Mentors</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {/* Start Interview Card */}
              <div className="lg:col-span-2 glass-card p-6 lg:p-8 neon-glow card-hover">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold mb-2">
                      Ready for Your Next Interview?
                    </h2>
                    <p className="text-gray-400 text-sm lg:text-base">
                      Practice with our AI interviewer and get instant feedback
                    </p>
                  </div>
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-[#00FFB2]/20 rounded-xl flex items-center justify-center">
                    <Play size={24} className="lg:w-8 lg:h-8 text-[#00FFB2]" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 lg:gap-4 mb-4 lg:mb-6">
                  <div className="bg-[#1A1A1A] rounded-lg p-3 lg:p-4 text-center">
                    <Target size={20} className="lg:w-6 lg:h-6 text-[#00FFB2] mx-auto mb-1 lg:mb-2" />
                    <div className="font-semibold text-xs lg:text-sm">Technical</div>
                    <div className="text-xs text-gray-400">45 min</div>
                  </div>
                  <div className="bg-[#1A1A1A] rounded-lg p-3 lg:p-4 text-center">
                    <Users size={20} className="lg:w-6 lg:h-6 text-[#00FFB2] mx-auto mb-1 lg:mb-2" />
                    <div className="font-semibold text-xs lg:text-sm">Behavioral</div>
                    <div className="text-xs text-gray-400">30 min</div>
                  </div>
                  <div className="bg-[#1A1A1A] rounded-lg p-3 lg:p-4 text-center">
                    <BookOpen
                      size={20}
                      className="lg:w-6 lg:h-6 text-[#00FFB2] mx-auto mb-1 lg:mb-2"
                    />
                    <div className="font-semibold text-xs lg:text-sm">Case Study</div>
                    <div className="text-xs text-gray-400">60 min</div>
                  </div>
                </div>

                <Link
                  href="/learner/interview/setup"
                  className="btn-primary flex items-center justify-center w-full py-2.5 lg:py-3 text-sm lg:text-base"
                >
                  <Play size={16} className="lg:w-5 lg:h-5 mr-2" />
                  Start AI Interview
                </Link>
              </div>

              {/* Progress Card */}
              <div className="glass-card p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg lg:text-xl font-semibold">Your Progress</h3>
                  <TrendingUp size={20} className="lg:w-6 lg:h-6 text-[#00FFB2]" />
                </div>

                <div className="space-y-3 lg:space-y-4">
                  <div>
                    <div className="flex justify-between text-xs lg:text-sm mb-1">
                      <span>Interview Skills</span>
                      <span className="text-[#00FFB2]">87%</span>
                    </div>
                    <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] h-2 rounded-full"
                        style={{ width: "87%" }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs lg:text-sm mb-1">
                      <span>Technical Knowledge</span>
                      <span className="text-[#00FFB2]">92%</span>
                    </div>
                    <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] h-2 rounded-full"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs lg:text-sm mb-1">
                      <span>Communication</span>
                      <span className="text-[#00FFB2]">79%</span>
                    </div>
                    <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] h-2 rounded-full"
                        style={{ width: "79%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/learner/scorecard"
                  className="btn-outline w-full mt-3 lg:mt-4 py-2 text-center block text-sm lg:text-base"
                >
                  View Detailed Report
                </Link>
                <Link
                  href="/learner/history"
                  className="btn-outline w-full mt-2 py-2 text-center block text-xs lg:text-sm"
                >
                  View All Records
                </Link>
              </div>
            </div>

            {/* Recent Interviews & Mentorship */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mb-6 lg:mb-8">
              {/* Recent Interview Scores */}
              <div className="glass-card p-4 lg:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg lg:text-xl font-semibold">
                    Recent Interview Scores
                  </h3>
                  <Trophy size={20} className="lg:w-6 lg:h-6 text-[#00FFB2]" />
                </div>

                <div className="space-y-3 lg:space-y-4">
                  {recentScores.map((interview, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 lg:p-4 bg-[#1A1A1A] rounded-lg"
                    >
                      <div>
                        <div className="font-semibold text-sm lg:text-base">{interview.role}</div>
                        <div className="text-xs lg:text-sm text-gray-400">
                          {interview.date}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl lg:text-2xl font-bold text-[#00FFB2]">
                          {interview.score}%
                        </div>
                        <div className="text-xs lg:text-sm text-green-400">
                          {interview.improvement}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/learner/scorecard"
                  className="btn-outline w-full mt-3 lg:mt-4 py-2 text-center block text-sm lg:text-base"
                >
                  View All Scores
                </Link>
              </div>

              {/* Upcoming Sessions */}
              <div className="glass-card p-4 lg:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg lg:text-xl font-semibold">Upcoming Sessions</h3>
                  <Calendar size={20} className="lg:w-6 lg:h-6 text-[#00FFB2]" />
                </div>

                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-center p-3 lg:p-4 bg-[#1A1A1A] rounded-lg">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#00FFB2] rounded-full flex items-center justify-center mr-3 lg:mr-4">
                      <Users size={16} className="lg:w-5 lg:h-5 text-black" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm lg:text-base">
                        1:1 Mentorship with Sarah Chen
                      </div>
                      <div className="text-xs lg:text-sm text-gray-400">
                        Tomorrow, 2:00 PM
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs lg:text-sm text-[#00FFB2]">
                        System Design
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center p-3 lg:p-4 bg-[#1A1A1A] rounded-lg">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#00FFB2]/20 rounded-full flex items-center justify-center mr-3 lg:mr-4">
                      <Clock size={16} className="lg:w-5 lg:h-5 text-[#00FFB2]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm lg:text-base">
                        Mock Interview Session
                      </div>
                      <div className="text-xs lg:text-sm text-gray-400">
                        Friday, 10:00 AM
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs lg:text-sm text-[#00FFB2]">Technical</div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/learner/sessions"
                  className="btn-outline w-full mt-3 lg:mt-4 py-2 text-center block text-sm lg:text-base"
                >
                  Manage Sessions
                </Link>
              </div>
            </div>

            {/* Recommended Mentors */}
            <div className="glass-card p-4 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl lg:text-2xl font-semibold mb-2">
                    Recommended Mentors
                  </h3>
                  <p className="text-gray-400 text-sm lg:text-base">
                    Based on your skill gaps and career goals
                  </p>
                </div>
                <Link
                  href="/learner/mentors"
                  className="btn-outline flex items-center text-sm lg:text-base px-3 lg:px-4 py-2"
                >
                  View All
                  <ArrowRight size={14} className="lg:w-4 lg:h-4 ml-1 lg:ml-2" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {recommendedMentors.map((mentor, index) => (
                  <div
                    key={index}
                    className="bg-[#1A1A1A] rounded-lg p-4 lg:p-6 card-hover"
                  >
                    <div className="flex items-center mb-3 lg:mb-4">
                      <img
                        src={mentor.image}
                        alt={mentor.name}
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-full mr-3 lg:mr-4"
                      />
                      <div>
                        <div className="font-semibold text-sm lg:text-base">{mentor.name}</div>
                        <div className="text-xs lg:text-sm text-gray-400">
                          {mentor.role}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 lg:mb-4">
                      <div className="text-xs lg:text-sm text-gray-400 mb-1">
                        {mentor.company}
                      </div>
                      <div className="flex items-center mb-2">
                        <Star size={14} className="lg:w-4 lg:h-4 text-yellow-400 mr-1" />
                        <span className="text-xs lg:text-sm font-medium">
                          {mentor.rating}
                        </span>
                        <span className="text-xs lg:text-sm text-gray-400 ml-2">
                          {mentor.price}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3 lg:mb-4">
                      <div className="flex flex-wrap gap-2">
                        {mentor.expertise
                          .slice(0, 2)
                          .map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="text-xs bg-[#00FFB2]/20 text-[#00FFB2] px-1.5 lg:px-2 py-0.5 lg:py-1 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        {mentor.expertise.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{mentor.expertise.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>

                    <button className="btn-primary w-full py-2 text-xs lg:text-sm">
                      Book Session
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement & Gamification */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mt-6 lg:mt-8">
              {/* Achievements */}
              <div className="glass-card p-4 lg:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg lg:text-xl font-semibold">Recent Achievements</h3>
                  <Award size={20} className="lg:w-6 lg:h-6 text-[#00FFB2]" />
                </div>

                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-center p-3 lg:p-4 bg-[#1A1A1A] rounded-lg">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mr-3 lg:mr-4">
                      <Trophy size={16} className="lg:w-5 lg:h-5 text-yellow-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm lg:text-base">Interview Streak</div>
                      <div className="text-xs lg:text-sm text-gray-400">
                        Completed 5 interviews in a row
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center p-3 lg:p-4 bg-[#1A1A1A] rounded-lg">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#00FFB2]/20 rounded-full flex items-center justify-center mr-3 lg:mr-4">
                      <Zap size={16} className="lg:w-5 lg:h-5 text-[#00FFB2]" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm lg:text-base">Quick Learner</div>
                      <div className="text-xs lg:text-sm text-gray-400">
                        Improved score by 15% in one week
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Upgrade */}
              <div className="glass-card p-4 lg:p-6 border-2 border-[#00FFB2]/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg lg:text-xl font-semibold">Upgrade Your Plan</h3>
                  <Star size={20} className="lg:w-6 lg:h-6 text-[#00FFB2]" />
                </div>

                <p className="text-gray-400 text-sm lg:text-base mb-3 lg:mb-4">
                  Unlock unlimited interviews, premium mentors, and advanced
                  analytics.
                </p>

                <div className="space-y-1 lg:space-y-2 mb-4 lg:mb-6">
                  <div className="flex items-center text-xs lg:text-sm">
                    <div className="w-2 h-2 bg-[#00FFB2] rounded-full mr-2"></div>
                    Unlimited AI interviews
                  </div>
                  <div className="flex items-center text-xs lg:text-sm">
                    <div className="w-2 h-2 bg-[#00FFB2] rounded-full mr-2"></div>
                    Priority mentor booking
                  </div>
                  <div className="flex items-center text-xs lg:text-sm">
                    <div className="w-2 h-2 bg-[#00FFB2] rounded-full mr-2"></div>
                    Advanced analytics & insights
                  </div>
                </div>

                <Link
                  href="/pricing"
                  className="btn-primary w-full py-2.5 lg:py-3 text-center block text-sm lg:text-base"
                >
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}