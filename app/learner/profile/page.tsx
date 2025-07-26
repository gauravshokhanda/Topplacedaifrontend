"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Image from "next/image";
import { Pencil, Mail, Phone, Briefcase, Star, Upload, FileText, ExternalLink, Linkedin, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LearnerProfilePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isFresher, setIsFresher] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    experience: user?.experience || "",
    goals: user?.goals || "",
    linkedinProfile: user?.linkedin_profile || "",
    resumeFile: null as File | null,
    profileImageFile: null as File | null,
  });

  const [uploadedResume, setUploadedResume] = useState<{
    name: string;
    url: string;
    uploadDate: string;
  } | null>(
    user?.resume_url ? {
      name: "Resume.pdf",
      url: user.resume_url,
      uploadDate: new Date().toLocaleDateString()
    } : null
  );

  useEffect(() => {
    setIsVisible(true);
    // Function to extract query parameters from URL
    const getQueryParams = () => {
      const params = new URLSearchParams(window.location.search);
      const name = params.get('name') || '';
      const phone = params.get('phone') || '';
      const experience = params.get('experience') || '';
      const goals = params.get('goals') || '';
      const linkedinProfile = params.get('linkedinProfile') || '';

      setFormData(prev => ({
        ...prev,
        name: name,
        phone: phone,
        experience: experience,
        goals: goals,
        linkedinProfile: linkedinProfile,
      }));
    };

    // Call getQueryParams on component mount
    getQueryParams();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, resumeFile: file }));
    
    if (file) {
      // Create preview for uploaded file
      const fileUrl = URL.createObjectURL(file);
      setUploadedResume({
        name: file.name,
        url: fileUrl,
        uploadDate: new Date().toLocaleDateString()
      });
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, profileImageFile: file }));
  };

  const handleSave = () => {
    console.log("Save clicked", formData);
    // TODO: API call here
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      experience: user?.experience || "",
      goals: user?.goals || "",
      linkedinProfile: user?.linkedin_profile || "",
      resumeFile: null,
      profileImageFile: null,
    });
  };

  const handleResumeRemove = () => {
    setUploadedResume(null);
    setFormData((prev) => ({ ...prev, resumeFile: null }));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />
        <Sidebar userType="learner" />

        <div className="ml-64 pt-20 pb-12">
          <div className="container-custom">
            <div
              className={`mb-8 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Your <span className="gradient-text">Profile</span>
              </h1>
              <p className="text-gray-400 text-lg">
                Review and manage your personal and career information
              </p>
            </div>

            <div className="space-y-8">
              {/* Main Profile Card */}
              <div className="glass-card p-8 neon-glow">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="relative">
                    <Image
                      src={user?.profile_image || "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"}
                      alt="Profile"
                      width={120}
                      height={120}
                      className="rounded-full border-2 border-[#00FFB2]"
                    />
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#00FFB2] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#00CC8E] transition-colors">
                        <Upload size={16} className="text-black" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">
                        {user?.name || "John Doe"}
                      </h2>
                      {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="btn-outline py-2 px-4 text-sm flex items-center gap-2"
                        >
                          <Pencil size={16} /> Edit Profile
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <>
                        {/* Fresher/Experienced Selection */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Experience Level
                          </label>
                          <Select onValueChange={(value) => setIsFresher(value === "fresher")}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fresher">Fresher</SelectItem>
                              <SelectItem value="experienced">Experienced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Full Name
                            </label>
                            <Input
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                              className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFB2] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Phone Number
                            </label>
                            <Input
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Enter your phone number"
                              className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFB2] focus:border-transparent"
                            />
                          </div>

                          {/* Conditional Rendering based on Experience */}
                          {isFresher === false && (
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Experience Level
                              </label>
                              <Input
                                name="experience"
                                value={formData.experience}
                                onChange={handleInputChange}
                                placeholder="e.g., 3 years in Software Development"
                                className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFB2] focus:border-transparent"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              LinkedIn Profile
                            </label>
                            <Input
                              name="linkedinProfile"
                              value={formData.linkedinProfile}
                              onChange={handleInputChange}
                              placeholder="https://linkedin.com/in/yourprofile"
                              className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFB2] focus:border-transparent"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Career Goals
                            </label>
                            <textarea
                              name="goals"
                              value={formData.goals}
                              onChange={handleInputChange}
                              placeholder="Describe your career aspirations and goals..."
                              rows={4}
                              className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFB2] focus:border-transparent resize-none"
                            />
                          </div>
                          <div className="md:col-span-2 flex gap-3 pt-4">
                            <button onClick={handleSave} className="btn-primary px-6 py-2">
                              Save Changes
                            </button>
                            <button onClick={handleCancel} className="btn-outline px-6 py-2">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center text-gray-300 gap-3">
                            <Mail size={18} className="text-[#00FFB2]" />
                            <span>{user?.email}</span>
                          </div>
                          <div className="flex items-center text-gray-300 gap-3">
                            <Phone size={18} className="text-[#00FFB2]" />
                            <span>{user?.phone || "Not added"}</span>
                          </div>
                          <div className="flex items-center text-gray-300 gap-3">
                            <Briefcase size={18} className="text-[#00FFB2]" />
                            <span>{user?.experience || "No experience added"}</span>
                          </div>
                          {user?.linkedin_profile && (
                            <div className="flex items-center text-gray-300 gap-3">
                              <Linkedin size={18} className="text-[#00FFB2]" />
                              <a 
                                href={user.linkedin_profile} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#00FFB2] hover:underline flex items-center gap-1"
                              >
                                LinkedIn Profile <ExternalLink size={14} />
                              </a>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Resume Upload Section */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <FileText size={24} className="text-[#00FFB2]" />
                    Resume
                  </h3>
                  {!isEditing && (
                    <label className="btn-outline cursor-pointer flex items-center gap-2">
                      <Upload size={16} />
                      Upload Resume
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                {uploadedResume ? (
                  <div className="bg-[#1A1A11A] rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                          <FileText size={24} className="text-red-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{uploadedResume.name}</div>
                          <div className="text-sm text-gray-400">
                            Uploaded on {uploadedResume.uploadDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={uploadedResume.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline py-1 px-3 text-sm flex items-center gap-1"
                        >
                          <ExternalLink size={14} />
                          View
                        </a>
                        <button
                          onClick={handleResumeRemove}
                          className="text-red-400 hover:text-red-300 text-sm px-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                    <FileText size={48} className="text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No resume uploaded yet</p>
                    <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
                      <Upload size={16} />
                      Upload Resume
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: PDF, DOC, DOCX (Max 5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Career Goals & Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Career Goals */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Target size={24} className="text-[#00FFB2]" />
                    Career Goals
                  </h3>
                  {user?.goals ? (
                    <div className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-600">
                      <p className="text-gray-300 leading-relaxed">{user.goals}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target size={48} className="text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No career goals set yet</p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn-outline"
                      >
                        Add Career Goals
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile Stats */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Star size={24} className="text-[#00FFB2]" />
                    Profile Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1A1A1A] p-4 rounded-lg text-center">
                      <div className="text-[#00FFB2] text-2xl font-bold">
                        {user?.profile_completion || 0}%
                      </div>
                      <div className="text-sm text-gray-400">
                        Profile Completion
                      </div>
                    </div>
                    <div className="bg-[#1A1A1A] p-4 rounded-lg text-center">
                      <div className="text-yellow-400 text-2xl font-bold">
                        4.5
                      </div>
                      <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
                        <Star size={14} /> Average Rating
                      </div>
                    </div>
                    <div className="bg-[#1A1A1A] p-4 rounded-lg text-center">
                      <div className="text-[#00FFB2] text-2xl font-bold">
                        {user?.tech_stack || "0"}
                      </div>
                      <div className="text-sm text-gray-400">Skills</div>
                    </div>
                    <div className="bg-[#1A1A1A] p-4 rounded-lg text-center">
                      <div className="text-[#00FFB2] text-2xl font-bold">
                        12
                      </div>
                      <div className="text-sm text-gray-400">Interviews</div>
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
