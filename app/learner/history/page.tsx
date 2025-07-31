'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar,
  Clock,
  Trophy,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Filter,
  Search,
  BarChart3,
  Target,
  Code,
  Users,
  Brain,
  Database,
  Cloud,
  Briefcase,
  ChevronDown,
  Star
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface InterviewRecord {
  id: string;
  category: string;
  level: string;
  duration: number;
  overallScore: number;
  scores: {
    technical: number;
    communication: number;
    problemSolving: number;
    codeQuality?: number;
  };
  completedAt: string;
  timeSpent: number;
  tabSwitchCount: number;
  codeSubmissions?: number;
  status: 'completed' | 'terminated' | 'incomplete';
}

export default function InterviewHistoryPage() {
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [isVisible, setIsVisible] = useState(false);
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock data - replace with actual API call
  const mockInterviews: InterviewRecord[] = [
    {
      id: '1',
      category: 'fullstack',
      level: 'mid',
      duration: 45,
      overallScore: 87,
      scores: {
        technical: 92,
        communication: 78,
        problemSolving: 85,
        codeQuality: 89
      },
      completedAt: '2024-01-20T14:30:00Z',
      timeSpent: 2700,
      tabSwitchCount: 0,
      codeSubmissions: 3,
      status: 'completed'
    },
    {
      id: '2',
      category: 'frontend',
      level: 'senior',
      duration: 60,
      overallScore: 92,
      scores: {
        technical: 95,
        communication: 88,
        problemSolving: 90,
        codeQuality: 94
      },
      completedAt: '2024-01-18T10:15:00Z',
      timeSpent: 3600,
      tabSwitchCount: 1,
      codeSubmissions: 2,
      status: 'completed'
    },
    {
      id: '3',
      category: 'hr',
      level: 'mid',
      duration: 30,
      overallScore: 76,
      scores: {
        technical: 0,
        communication: 82,
        problemSolving: 70
      },
      completedAt: '2024-01-15T16:45:00Z',
      timeSpent: 1800,
      tabSwitchCount: 0,
      status: 'completed'
    },
    {
      id: '4',
      category: 'backend',
      level: 'entry',
      duration: 45,
      overallScore: 65,
      scores: {
        technical: 68,
        communication: 60,
        problemSolving: 67,
        codeQuality: 65
      },
      completedAt: '2024-01-12T09:20:00Z',
      timeSpent: 2100,
      tabSwitchCount: 3,
      status: 'terminated'
    },
    {
      id: '5',
      category: 'sql',
      level: 'mid',
      duration: 30,
      overallScore: 84,
      scores: {
        technical: 88,
        communication: 75,
        problemSolving: 89,
        codeQuality: 84
      },
      completedAt: '2024-01-10T13:10:00Z',
      timeSpent: 1650,
      tabSwitchCount: 0,
      codeSubmissions: 4,
      status: 'completed'
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    fetchInterviewHistory();
  }, []);

  const fetchInterviewHistory = async () => {
    try {
      setLoading(true);
      
      // Replace with actual API call
      const response = await fetch(`${API_URL}/users/${user?._id}/interview-history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn('API endpoint not available, using mock data');
        setInterviews(mockInterviews);
        return;
      }

      const data = await response.json();
      setInterviews(data.interviews || mockInterviews);
    } catch (error) {
      console.warn('Backend API not available, using mock data');
      setInterviews(mockInterviews);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hr': return Users;
      case 'product-manager': return Briefcase;
      case 'fullstack': return Code;
      case 'frontend': return Code;
      case 'backend': return Database;
      case 'sql': return Database;
      case 'data-analyst': return Brain;
      case 'aws': return Cloud;
      case 'devops': return Cloud;
      default: return Code;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hr': return 'text-blue-400';
      case 'product-manager': return 'text-purple-400';
      case 'fullstack': return 'text-[#00FFB2]';
      case 'frontend': return 'text-yellow-400';
      case 'backend': return 'text-red-400';
      case 'sql': return 'text-orange-400';
      case 'data-analyst': return 'text-pink-400';
      case 'aws': return 'text-cyan-400';
      case 'devops': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-[#00FFB2]';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'terminated': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'incomplete': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const filteredAndSortedInterviews = interviews
    .filter(interview => {
      const matchesSearch = interview.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           interview.level.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || interview.category === filterCategory;
      const matchesLevel = filterLevel === 'all' || interview.level === filterLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.completedAt).getTime();
          bValue = new Date(b.completedAt).getTime();
          break;
        case 'score':
          aValue = a.overallScore;
          bValue = b.overallScore;
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        default:
          aValue = new Date(a.completedAt).getTime();
          bValue = new Date(b.completedAt).getTime();
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const averageScore = interviews.length > 0 
    ? Math.round(interviews.reduce((sum, interview) => sum + interview.overallScore, 0) / interviews.length)
    : 0;

  const completedInterviews = interviews.filter(i => i.status === 'completed').length;
  const totalTimeSpent = interviews.reduce((sum, interview) => sum + interview.timeSpent, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <Sidebar userType="learner" />
        <div className="ml-64 pt-20 pb-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFB2] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your interview history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Sidebar userType="learner" />

      <div className="ml-64 pt-20 pb-12">
        <div className="container-custom space-y-8">
          {/* Header */}
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Interview <span className="gradient-text">History</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Track your progress and review past interview performances
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 text-center">
              <Trophy size={24} className="text-[#00FFB2] mx-auto mb-3" />
              <div className="text-2xl font-bold">{interviews.length}</div>
              <div className="text-sm text-gray-400">Total Interviews</div>
            </div>
            <div className="glass-card p-6 text-center">
              <Target size={24} className="text-[#00FFB2] mx-auto mb-3" />
              <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>{averageScore}%</div>
              <div className="text-sm text-gray-400">Average Score</div>
            </div>
            <div className="glass-card p-6 text-center">
              <Star size={24} className="text-[#00FFB2] mx-auto mb-3" />
              <div className="text-2xl font-bold">{completedInterviews}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
            <div className="glass-card p-6 text-center">
              <Clock size={24} className="text-[#00FFB2] mx-auto mb-3" />
              <div className="text-2xl font-bold">{Math.round(totalTimeSpent / 3600)}h</div>
              <div className="text-sm text-gray-400">Total Time</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="glass-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search interviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFB2]"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-[#1A1A1A] border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFB2]"
              >
                <option value="all">All Categories</option>
                <option value="hr">HR Interview</option>
                <option value="fullstack">Full-Stack</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="sql">SQL</option>
                <option value="data-analyst">Data Analyst</option>
                <option value="aws">AWS</option>
              </select>

              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="bg-[#1A1A1A] border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFB2]"
              >
                <option value="all">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="lead">Lead/Principal</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#1A1A1A] border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFB2]"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="duration">Sort by Duration</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="btn-outline flex items-center justify-center"
              >
                {sortOrder === 'asc' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="ml-2">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
              </button>
            </div>
          </div>

          {/* Interview Records */}
          <div className="space-y-4">
            {filteredAndSortedInterviews.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <BarChart3 size={48} className="text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Interview Records Found</h3>
                <p className="text-gray-400 mb-6">
                  {interviews.length === 0 
                    ? "You haven't taken any interviews yet. Start your first interview to see your progress here."
                    : "No interviews match your current filters. Try adjusting your search criteria."
                  }
                </p>
                <button
                  onClick={() => router.push('/learner/interview/setup')}
                  className="btn-primary"
                >
                  Start Your First Interview
                </button>
              </div>
            ) : (
              filteredAndSortedInterviews.map((interview) => {
                const IconComponent = getCategoryIcon(interview.category);
                const categoryColor = getCategoryColor(interview.category);
                
                return (
                  <div key={interview.id} className="glass-card p-6 hover:border-[#00FFB2]/40 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg bg-[#1A1A1A] flex items-center justify-center`}>
                          <IconComponent size={24} className={categoryColor} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold capitalize">
                            {interview.category.replace('-', ' ')} Interview
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="capitalize">{interview.level} Level</span>
                            <span>•</span>
                            <span>{interview.duration} minutes</span>
                            <span>•</span>
                            <span>{formatDate(interview.completedAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(interview.overallScore)}`}>
                            {interview.overallScore}%
                          </div>
                          <div className="text-sm text-gray-400">Overall Score</div>
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${getStatusColor(interview.status)}`}>
                          {interview.status}
                        </div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${getScoreColor(interview.scores.technical)}`}>
                          {interview.scores.technical}%
                        </div>
                        <div className="text-xs text-gray-400">Technical</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${getScoreColor(interview.scores.communication)}`}>
                          {interview.scores.communication}%
                        </div>
                        <div className="text-xs text-gray-400">Communication</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${getScoreColor(interview.scores.problemSolving)}`}>
                          {interview.scores.problemSolving}%
                        </div>
                        <div className="text-xs text-gray-400">Problem Solving</div>
                      </div>
                      {interview.scores.codeQuality && (
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getScoreColor(interview.scores.codeQuality)}`}>
                            {interview.scores.codeQuality}%
                          </div>
                          <div className="text-xs text-gray-400">Code Quality</div>
                        </div>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>Time: {formatDuration(interview.timeSpent)}</span>
                        </div>
                        {interview.codeSubmissions && (
                          <div className="flex items-center space-x-1">
                            <Code size={14} />
                            <span>{interview.codeSubmissions} code submissions</span>
                          </div>
                        )}
                        {interview.tabSwitchCount > 0 && (
                          <div className="flex items-center space-x-1 text-yellow-400">
                            <span>⚠️ {interview.tabSwitchCount} tab switches</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/learner/interview/results?id=${interview.id}`)}
                          className="btn-outline py-1 px-3 text-sm flex items-center"
                        >
                          <Eye size={14} className="mr-1" />
                          View Details
                        </button>
                        <button className="btn-outline py-1 px-3 text-sm flex items-center">
                          <Download size={14} className="mr-1" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Performance Trends */}
          {interviews.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <TrendingUp className="h-6 w-6 text-[#00FFB2] mr-2" />
                Performance Trends
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-[#1A1A1A] rounded-lg">
                  <div className="text-2xl font-bold text-[#00FFB2] mb-1">
                    {Math.max(...interviews.map(i => i.overallScore))}%
                  </div>
                  <div className="text-sm text-gray-400">Best Score</div>
                </div>
                
                <div className="text-center p-4 bg-[#1A1A1A] rounded-lg">
                  <div className="text-2xl font-bold text-[#00FFB2] mb-1">
                    {interviews.filter(i => i.overallScore >= 80).length}
                  </div>
                  <div className="text-sm text-gray-400">High Scores (80%+)</div>
                </div>
                
                <div className="text-center p-4 bg-[#1A1A1A] rounded-lg">
                  <div className="text-2xl font-bold text-[#00FFB2] mb-1">
                    {new Set(interviews.map(i => i.category)).size}
                  </div>
                  <div className="text-sm text-gray-400">Categories Explored</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}