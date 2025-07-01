'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Award,
  Settings,
  BarChart3,
  UserCheck,
  Clock,
  Star
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function AdminDashboard() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const quickStats = [
    { label: 'Total Users', value: '12,847', change: '+15%', icon: Users, color: 'text-blue-400' },
    { label: 'Active Mentors', value: '1,234', change: '+8%', icon: UserCheck, color: 'text-green-400' },
    { label: 'Interviews Today', value: '456', change: '+23%', icon: MessageSquare, color: 'text-purple-400' },
    { label: 'Revenue (MTD)', value: '$89,234', change: '+12%', icon: DollarSign, color: 'text-[#00FFB2]' }
  ];

  const recentActivity = [
    { action: 'New mentor registration', user: 'Dr. Sarah Johnson', time: '5 min ago', type: 'mentor' },
    { action: 'Interview completed', user: 'Alex Chen', time: '12 min ago', type: 'interview' },
    { action: 'Mentor profile updated', user: 'Michael Rodriguez', time: '1 hour ago', type: 'update' },
    { action: 'New learner signup', user: 'Emily Watson', time: '2 hours ago', type: 'learner' },
    { action: 'Payment processed', user: 'David Kim', time: '3 hours ago', type: 'payment' }
  ];

  const topMentors = [
    { name: 'Dr. Sarah Johnson', sessions: 45, rating: 4.9, earnings: '$6,750' },
    { name: 'Michael Rodriguez', sessions: 38, rating: 4.8, earnings: '$5,700' },
    { name: 'Emily Watson', sessions: 42, rating: 4.9, earnings: '$6,300' },
    { name: 'David Kim', sessions: 35, rating: 4.7, earnings: '$5,250' }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Sidebar userType="mentor" />
      
      <div className="ml-64 pt-20 pb-12">
        <div className="container-custom">
          {/* Header */}
          <div className={`mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Admin <span className="gradient-text">Dashboard</span> 
                </h1>
                <p className="text-gray-400 text-lg">Manage and monitor the SkillMentor AI platform</p>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/admin/settings" className="btn-outline flex items-center">
                  <Settings size={16} className="mr-2" />
                  Settings
                </Link>
                <Link href="/admin/reports" className="btn-primary flex items-center">
                  <BarChart3 size={16} className="mr-2" />
                  Reports
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="glass-card p-6 neon-glow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-[#00FFB2]/20 rounded-xl flex items-center justify-center">
                      <IconComponent size={24} className="text-[#00FFB2]" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className={`text-sm ${stat.color}`}>{stat.change}</div>
                    </div>
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
              
              <div className="space-y-4">
                <Link href="/admin/users" className="flex items-center p-4 bg-[#1A1A1A] rounded-lg hover:bg-[#00FFB2]/10 transition-colors card-hover">
                  <Users size={20} className="text-[#00FFB2] mr-3" />
                  <div>
                    <div className="font-semibold">Manage Users</div>
                    <div className="text-sm text-gray-400">View and edit user accounts</div>
                  </div>
                </Link>
                
                <Link href="/admin/mentors" className="flex items-center p-4 bg-[#1A1A1A] rounded-lg hover:bg-[#00FFB2]/10 transition-colors card-hover">
                  <UserCheck size={20} className="text-[#00FFB2] mr-3" />
                  <div>
                    <div className="font-semibold">Mentor Approvals</div>
                    <div className="text-sm text-gray-400">Review pending mentor applications</div>
                  </div>
                </Link>
                
                <Link href="/admin/questions" className="flex items-center p-4 bg-[#1A1A1A] rounded-lg hover:bg-[#00FFB2]/10 transition-colors card-hover">
                  <BookOpen size={20} className="text-[#00FFB2] mr-3" />
                  <div>
                    <div className="font-semibold">Interview Questions</div>
                    <div className="text-sm text-gray-400">Manage AI interview question bank</div>
                  </div>
                </Link>
                
                <Link href="/admin/roles" className="flex items-center p-4 bg-[#1A1A1A] rounded-lg hover:bg-[#00FFB2]/10 transition-colors card-hover">
                  <Target size={20} className="text-[#00FFB2] mr-3" />
                  <div>
                    <div className="font-semibold">Job Roles</div>
                    <div className="text-sm text-gray-400">Configure job roles and levels</div>
                  </div>
                </Link>
                
                <Link href="/admin/analytics" className="flex items-center p-4 bg-[#1A1A1A] rounded-lg hover:bg-[#00FFB2]/10 transition-colors card-hover">
                  <BarChart3 size={20} className="text-[#00FFB2] mr-3" />
                  <div>
                    <div className="font-semibold">Platform Analytics</div>
                    <div className="text-sm text-gray-400">View detailed platform metrics</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2 glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Recent Activity</h3>
                <Link href="/admin/activity" className="text-[#00FFB2] text-sm hover:underline">
                  View All
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        activity.type === 'mentor' ? 'bg-green-500' :
                        activity.type === 'interview' ? 'bg-blue-500' :
                        activity.type === 'learner' ? 'bg-purple-500' :
                        activity.type === 'payment' ? 'bg-[#00FFB2]' :
                        'bg-yellow-500'
                      }`}></div>
                      <div>
                        <div className="font-semibold text-sm">{activity.action}</div>
                        <div className="text-sm text-gray-400">{activity.user}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Platform Metrics */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-6">Platform Metrics</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Interview Success Rate</span>
                    <span className="text-[#00FFB2]">94.2%</span>
                  </div>
                  <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                    <div className="bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] h-2 rounded-full" style={{width: '94.2%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Mentor Satisfaction</span>
                    <span className="text-[#00FFB2]">4.8/5.0</span>
                  </div>
                  <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                    <div className="bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] h-2 rounded-full" style={{width: '96%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>User Retention (30d)</span>
                    <span className="text-[#00FFB2]">87.5%</span>
                  </div>
                  <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                    <div className="bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] h-2 rounded-full" style={{width: '87.5%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Payment Success Rate</span>
                    <span className="text-[#00FFB2]">99.1%</span>
                  </div>
                  <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                    <div className="bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] h-2 rounded-full" style={{width: '99.1%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performing Mentors */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Top Performing Mentors</h3>
                <Award size={20} className="text-[#00FFB2]" />
              </div>
              
              <div className="space-y-4">
                {topMentors.map((mentor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#00FFB2] rounded-full flex items-center justify-center mr-3 text-black font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{mentor.name}</div>
                        <div className="text-sm text-gray-400">
                          {mentor.sessions} sessions • {mentor.rating} ⭐
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#00FFB2]">{mentor.earnings}</div>
                      <div className="text-sm text-gray-400">This month</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link href="/admin/mentors" className="btn-outline w-full mt-4 py-2 text-center block text-sm">
                View All Mentors
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">System Status</h3>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-400">All Systems Operational</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-[#1A1A1A] rounded-lg">
                <div className="text-2xl font-bold text-green-400 mb-2">99.9%</div>
                <div className="text-sm text-gray-400">API Uptime</div>
              </div>
              
              <div className="text-center p-4 bg-[#1A1A1A] rounded-lg">
                <div className="text-2xl font-bold text-green-400 mb-2">45ms</div>
                <div className="text-sm text-gray-400">Avg Response</div>
              </div>
              
              <div className="text-center p-4 bg-[#1A1A1A] rounded-lg">
                <div className="text-2xl font-bold text-green-400 mb-2">1,234</div>
                <div className="text-sm text-gray-400">Active Sessions</div>
              </div>
              
              <div className="text-center p-4 bg-[#1A1A1A] rounded-lg">
                <div className="text-2xl font-bold text-green-400 mb-2">0</div>
                <div className="text-sm text-gray-400">Critical Issues</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}