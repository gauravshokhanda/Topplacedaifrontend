"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Star,
  Clock,
  ArrowRight,
  Award,
  Target,
  BookOpen,
  Video,
  MessageSquare,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";

export default function MentorDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const upcomingSessions = [
    {
      student: "Alex Johnson",
      topic: "System Design Interview Prep",
      time: "Today, 2:00 PM",
      duration: "60 min",
      type: "video",
      avatar:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
    },
    {
      student: "Maria Garcia",
      topic: "Career Transition Guidance",
      time: "Tomorrow, 10:00 AM",
      duration: "45 min",
      type: "video",
      avatar:
        "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
    },
    {
      student: "David Kim",
      topic: "Technical Interview Practice",
      time: "Friday, 3:30 PM",
      duration: "90 min",
      type: "video",
      avatar:
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
    },
  ];

  const recentReviews = [
    {
      student: "Sarah Chen",
      rating: 5,
      comment:
        "Incredible mentor! Really helped me understand system design concepts.",
    },
    {
      student: "Michael Brown",
      rating: 5,
      comment: "Patient and knowledgeable. Great at explaining complex topics.",
    },
    {
      student: "Jessica Wang",
      rating: 4,
      comment: "Very helpful session. Looking forward to our next meeting.",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />
        <Sidebar userType="mentor" />

        <div className="ml-64 pt-20 pb-12">
          <div className="container-custom">
            {/* Welcome Header */}
            <div
              className={`mb-8 transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Good morning,{" "}
                    <span className="gradient-text">
                      {user ? user.name : "demo"}
                    </span>
                    ! ✨
                  </h1>
                  <p className="text-gray-400 text-lg">
                    Ready to help shape some careers today?
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00FFB2]">4.9</div>
                    <div className="text-sm text-gray-400">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00FFB2]">127</div>
                    <div className="text-sm text-gray-400">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00FFB2]">
                      $2.8k
                    </div>
                    <div className="text-sm text-gray-400">This Month</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Earnings */}
              <div className="glass-card p-6 neon-glow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#00FFB2]/20 rounded-xl flex items-center justify-center">
                    <DollarSign size={24} className="text-[#00FFB2]" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">$12,450</div>
                    <div className="text-sm text-green-400">
                      +23% this month
                    </div>
                  </div>
                </div>
                <div className="text-gray-400">Total Earnings</div>
              </div>

              {/* Sessions This Week */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#00FFB2]/20 rounded-xl flex items-center justify-center">
                    <Calendar size={24} className="text-[#00FFB2]" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">18</div>
                    <div className="text-sm text-blue-400">
                      +3 from last week
                    </div>
                  </div>
                </div>
                <div className="text-gray-400">Sessions This Week</div>
              </div>

              {/* Active Students */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#00FFB2]/20 rounded-xl flex items-center justify-center">
                    <Users size={24} className="text-[#00FFB2]" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">45</div>
                    <div className="text-sm text-purple-400">
                      +7 new this month
                    </div>
                  </div>
                </div>
                <div className="text-gray-400">Active Students</div>
              </div>

              {/* Average Rating */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#00FFB2]/20 rounded-xl flex items-center justify-center">
                    <Star size={24} className="text-[#00FFB2]" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">4.9</div>
                    <div className="text-sm text-yellow-400">235 reviews</div>
                  </div>
                </div>
                <div className="text-gray-400">Average Rating</div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Upcoming Sessions */}
              <div className="lg:col-span-2 glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold">Upcoming Sessions</h3>
                  <Link
                    href="/mentor/sessions"
                    className="btn-outline flex items-center text-sm"
                  >
                    View All
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {upcomingSessions.map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg card-hover"
                    >
                      <div className="flex items-center">
                        <img
                          src={session.avatar}
                          alt={session.student}
                          className="w-12 h-12 rounded-full mr-4"
                        />
                        <div>
                          <div className="font-semibold">{session.student}</div>
                          <div className="text-sm text-gray-400">
                            {session.topic}
                          </div>
                          <div className="text-sm text-[#00FFB2]">
                            {session.time}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right text-gray-400 text-sm">
                          <div>{session.duration}</div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="w-8 h-8 bg-[#00FFB2]/20 rounded-lg flex items-center justify-center hover:bg-[#00FFB2]/30 transition-colors">
                            <Video size={16} className="text-[#00FFB2]" />
                          </button>
                          <button className="w-8 h-8 bg-[#00FFB2]/20 rounded-lg flex items-center justify-center hover:bg-[#00FFB2]/30 transition-colors">
                            <MessageSquare
                              size={16}
                              className="text-[#00FFB2]"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-[#1A1A1A] rounded-lg border-2 border-dashed border-gray-600">
                  <div className="text-center">
                    <Clock size={24} className="text-gray-500 mx-auto mb-2" />
                    <div className="text-gray-400 mb-3">
                      No more sessions today
                    </div>
                    <Link
                      href="/mentor/availability"
                      className="btn-primary inline-flex items-center text-sm"
                    >
                      Update Availability
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Stats & Actions */}
              <div className="space-y-6">
                {/* Earnings This Month */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Monthly Progress</h4>
                    <TrendingUp size={20} className="text-[#00FFB2]" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Earnings Goal</span>
                        <span className="text-[#00FFB2]">$2,800 / $3,500</span>
                      </div>
                      <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] h-2 rounded-full"
                          style={{ width: "80%" }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Sessions</span>
                        <span className="text-[#00FFB2]">28 / 35</span>
                      </div>
                      <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] h-2 rounded-full"
                          style={{ width: "80%" }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/mentor/earnings"
                    className="btn-outline w-full mt-4 py-2 text-center block text-sm"
                  >
                    View Detailed Earnings
                  </Link>
                </div>

                {/* Profile Completion */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Profile Strength</h4>
                    <Target size={20} className="text-[#00FFB2]" />
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Completion</span>
                      <span className="text-[#00FFB2]">92%</span>
                    </div>
                    <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] h-2 rounded-full"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-400 mb-4">
                    Add certifications to reach 100%
                  </div>

                  <Link
                    href="/mentor/profile"
                    className="btn-outline w-full py-2 text-center block text-sm"
                  >
                    Update Profile
                  </Link>
                </div>

                {/* Quick Actions */}
                <div className="glass-card p-6">
                  <h4 className="text-lg font-semibold mb-4">Quick Actions</h4>

                  <div className="space-y-3">
                    <Link
                      href="/mentor/availability"
                      className="flex items-center p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#00FFB2]/10 transition-colors"
                    >
                      <Calendar size={16} className="text-[#00FFB2] mr-3" />
                      <span className="text-sm">Set Availability</span>
                    </Link>

                    <Link
                      href="/mentor/resources"
                      className="flex items-center p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#00FFB2]/10 transition-colors"
                    >
                      <BookOpen size={16} className="text-[#00FFB2] mr-3" />
                      <span className="text-sm">Learning Resources</span>
                    </Link>

                    <Link
                      href="/mentor/analytics"
                      className="flex items-center p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#00FFB2]/10 transition-colors"
                    >
                      <TrendingUp size={16} className="text-[#00FFB2] mr-3" />
                      <span className="text-sm">View Analytics</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Reviews & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Reviews */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Recent Reviews</h3>
                  <div className="flex items-center">
                    <Star size={20} className="text-yellow-400 mr-1" />
                    <span className="font-semibold">4.9</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {recentReviews.map((review, index) => (
                    <div key={index} className="p-4 bg-[#1A1A1A] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{review.student}</div>
                        <div className="flex items-center">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className="text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">{review.comment}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href="/mentor/reviews"
                  className="btn-outline w-full mt-4 py-2 text-center block text-sm"
                >
                  View All Reviews
                </Link>
              </div>

              {/* Performance Insights */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">
                    Performance Insights
                  </h3>
                  <Award size={20} className="text-[#00FFB2]" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg">
                    <div>
                      <div className="font-semibold">Response Rate</div>
                      <div className="text-sm text-gray-400">
                        Average reply time
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#00FFB2]">
                        {"< 2h"}
                      </div>
                      <div className="text-sm text-green-400">Excellent</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg">
                    <div>
                      <div className="font-semibold">Booking Rate</div>
                      <div className="text-sm text-gray-400">
                        Profile to booking
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#00FFB2]">
                        78%
                      </div>
                      <div className="text-sm text-green-400">
                        Above Average
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg">
                    <div>
                      <div className="font-semibold">Completion Rate</div>
                      <div className="text-sm text-gray-400">
                        Successful sessions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#00FFB2]">
                        96%
                      </div>
                      <div className="text-sm text-green-400">Outstanding</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
