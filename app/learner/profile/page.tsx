"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Image from "next/image";
import {
  Pencil,
  Mail,
  Phone,
  Briefcase,
  Star,
  Upload,
  FileText,
  ExternalLink,
  Linkedin,
  Target,
  GraduationCap,
  Settings,
  Download,
  Trash2,
  User,
  MapPin,
  Calendar,
  Award,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ExtractedData {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedinProfile: string;
  goals: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
}

export default function LearnerProfilePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );
  const [showExtractedData, setShowExtractedData] = useState(false);
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: "",
    linkedinProfile: user?.linkedin_profile || "",
    goals: user?.goals || "",
    skills: [],
    experience: [],
    education: [],
  });

  console.log(token);
  console.log(user?._id);
  const [uploadedResume, setUploadedResume] = useState<{
    filename: string;
    url: string;
    uploadDate: string;
  } | null>(
    user?.resume_url
      ? {
          filename: "Resume.pdf",
          url: user.resume_url,
          uploadDate: new Date().toLocaleDateString(),
        }
      : null
  );

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkillAdd = (skill: string) => {
    if (skill.trim() && !profileData.skills.includes(skill.trim())) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill.trim()],
      }));
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleExperienceAdd = () => {
    setProfileData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          title: "",
          company: "",
          duration: "",
          description: "",
        },
      ],
    }));
  };

  const handleExperienceUpdate = (
    index: number,
    field: string,
    value: string
  ) => {
    setProfileData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const handleExperienceRemove = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleEducationAdd = () => {
    setProfileData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: "",
          institution: "",
          year: "",
        },
      ],
    }));
  };

  const handleEducationUpdate = (
    index: number,
    field: string,
    value: string
  ) => {
    setProfileData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const handleEducationRemove = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file only");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_URL}/users/${user?._id}/resume`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadedResume({
          filename: data.resume.filename,
          url: data.resume.url,
          uploadDate: new Date().toLocaleDateString(),
        });

        if (data.resume.extracted_data) {
          setExtractedData(data.resume.extracted_data);
          setShowExtractedData(true);
          toast.success("Resume uploaded and data extracted successfully!");
        } else {
          toast.success("Resume uploaded successfully!");
        }
      } else {
        toast.error(data.message || "Failed to upload resume");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyExtractedData = () => {
    if (extractedData) {
      setProfileData((prev) => ({
        ...prev,
        name: extractedData.name || prev.name,
        email: extractedData.email || prev.email,
        phone: extractedData.phone || prev.phone,
        skills: extractedData.skills || prev.skills,
        experience: extractedData.experience || prev.experience,
        education: extractedData.education || prev.education,
      }));
      setShowExtractedData(false);
      setIsEditing(true);
      toast.success("Extracted data applied to profile!");
    }
  };

  const handleSave = async () => {
    try {
      // Here you would make an API call to save the profile data
      console.log("Saving profile data:", profileData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowExtractedData(false);
    // Reset to original data
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: "",
      linkedinProfile: user?.linkedin_profile || "",
      goals: user?.goals || "",
      skills: [],
      experience: [],
      education: [],
    });
  };

  const handleResumeRemove = () => {
    setUploadedResume(null);
    toast.success("Resume removed");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />
        <Sidebar userType="learner" />

        <div className="ml-64 pt-20 pb-12">
          <div className="container-custom">
            {/* Header */}
            <div
              className={`mb-8 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Your <span className="gradient-text">Professional Profile</span>
              </h1>
              <p className="text-gray-400 text-lg">
                Build your professional presence and showcase your expertise
              </p>
            </div>

            {/* Extracted Data Preview Modal */}
            {showExtractedData && extractedData && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="glass-card p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold">
                      Extracted Resume Data
                    </h3>
                    <button
                      onClick={() => setShowExtractedData(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    {extractedData.name && (
                      <div>
                        <label className="text-sm font-medium text-gray-300">
                          Name
                        </label>
                        <p className="text-white">{extractedData.name}</p>
                      </div>
                    )}
                    {extractedData.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-300">
                          Email
                        </label>
                        <p className="text-white">{extractedData.email}</p>
                      </div>
                    )}
                    {extractedData.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-300">
                          Phone
                        </label>
                        <p className="text-white">{extractedData.phone}</p>
                      </div>
                    )}
                    {extractedData.skills &&
                      extractedData.skills.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-300">
                            Skills
                          </label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {extractedData.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-[#00FFB2]/20 text-[#00FFB2] rounded-full text-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleApplyExtractedData}
                      className="btn-primary flex-1"
                    >
                      Apply to Profile
                    </button>
                    <button
                      onClick={() => setShowExtractedData(false)}
                      className="btn-outline flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {/* Profile Header Card */}
              <div className="glass-card p-8 neon-glow">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                  {/* Profile Image */}
                  <div className="relative">
                    <Image
                      src={
                        user?.profile_image ||
                        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                      }
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
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-bold">
                          {profileData.name || "Your Name"}
                        </h2>
                        <p className="text-gray-400 text-lg">
                          Software Developer
                        </p>
                      </div>
                      {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="btn-outline py-2 px-4 text-sm flex items-center gap-2"
                        >
                          <Pencil size={16} /> Edit Profile
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center text-gray-300 gap-3">
                        <Mail size={18} className="text-[#00FFB2]" />
                        <span>{profileData.email || "email@example.com"}</span>
                      </div>
                      <div className="flex items-center text-gray-300 gap-3">
                        <Phone size={18} className="text-[#00FFB2]" />
                        <span>{profileData.phone || "Not added"}</span>
                      </div>
                      <div className="flex items-center text-gray-300 gap-3">
                        <MapPin size={18} className="text-[#00FFB2]" />
                        <span>
                          {profileData.location || "Location not set"}
                        </span>
                      </div>
                    </div>

                    {profileData.linkedinProfile && (
                      <div className="flex items-center text-gray-300 gap-3">
                        <Linkedin size={18} className="text-[#00FFB2]" />
                        <a
                          href={profileData.linkedinProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#00FFB2] hover:underline flex items-center gap-1"
                        >
                          LinkedIn Profile <ExternalLink size={14} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Mode Fields */}
                {isEditing && (
                  <div className="mt-8 pt-8 border-t border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Full Name
                        </label>
                        <Input
                          value={profileData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          placeholder="Enter your full name"
                          className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <Input
                          value={profileData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder="Enter your phone number"
                          className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Location
                        </label>
                        <Input
                          value={profileData.location}
                          onChange={(e) =>
                            handleInputChange("location", e.target.value)
                          }
                          placeholder="City, Country"
                          className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          LinkedIn Profile
                        </label>
                        <Input
                          value={profileData.linkedinProfile}
                          onChange={(e) =>
                            handleInputChange("linkedinProfile", e.target.value)
                          }
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSave}
                        className="btn-primary px-6 py-2"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancel}
                        className="btn-outline px-6 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Resume Upload Section */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <FileText size={24} className="text-[#00FFB2]" />
                    Resume & AI Extraction
                  </h3>
                </div>

                {uploadedResume ? (
                  <div className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-600 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                          <FileText size={24} className="text-red-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {uploadedResume.filename}
                          </div>
                          <div className="text-sm text-gray-400">
                            Uploaded on {uploadedResume.uploadDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`${API_URL}${uploadedResume.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline py-1 px-3 text-sm flex items-center gap-1"
                        >
                          <Download size={14} />
                          Download
                        </a>
                        <button
                          onClick={handleResumeRemove}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <FileText size={48} className="text-gray-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">
                    Upload Your Resume
                  </h4>
                  <p className="text-gray-400 mb-4">
                    Upload a PDF resume and let AI extract your information
                    automatically
                  </p>
                  <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
                    {isUploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Upload Resume (PDF)
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF format only, Max 5MB
                  </p>
                </div>
              </div>

              {/* Skills Section */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Settings size={24} className="text-[#00FFB2]" />
                    Skills
                  </h3>
                  {isEditing && (
                    <button
                      onClick={() => {
                        const skill = prompt("Enter a skill:");
                        if (skill) handleSkillAdd(skill);
                      }}
                      className="btn-outline py-1 px-3 text-sm flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Skill
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {profileData.skills.length > 0 ? (
                    profileData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#00FFB2]/20 text-[#00FFB2] rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => handleSkillRemove(skill)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <div className="text-center py-8 w-full">
                      <Settings
                        size={48}
                        className="text-gray-500 mx-auto mb-4"
                      />
                      <p className="text-gray-400 mb-4">No skills added yet</p>
                      {isEditing && (
                        <button
                          onClick={() => {
                            const skill = prompt("Enter a skill:");
                            if (skill) handleSkillAdd(skill);
                          }}
                          className="btn-outline"
                        >
                          Add Your First Skill
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Experience Section */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Briefcase size={24} className="text-[#00FFB2]" />
                    Experience
                  </h3>
                  {isEditing && (
                    <button
                      onClick={handleExperienceAdd}
                      className="btn-outline py-1 px-3 text-sm flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Experience
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {profileData.experience.length > 0 ? (
                    profileData.experience.map((exp, index) => (
                      <div
                        key={index}
                        className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-600"
                      >
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">
                                Experience {index + 1}
                              </h4>
                              <button
                                onClick={() => handleExperienceRemove(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                value={exp.title}
                                onChange={(e) =>
                                  handleExperienceUpdate(
                                    index,
                                    "title",
                                    e.target.value
                                  )
                                }
                                placeholder="Job Title"
                                className="bg-[#0A0A0A] border border-gray-700"
                              />
                              <Input
                                value={exp.company}
                                onChange={(e) =>
                                  handleExperienceUpdate(
                                    index,
                                    "company",
                                    e.target.value
                                  )
                                }
                                placeholder="Company Name"
                                className="bg-[#0A0A0A] border border-gray-700"
                              />
                              <Input
                                value={exp.duration}
                                onChange={(e) =>
                                  handleExperienceUpdate(
                                    index,
                                    "duration",
                                    e.target.value
                                  )
                                }
                                placeholder="Duration (e.g., Jan 2020 - Present)"
                                className="bg-[#0A0A0A] border border-gray-700"
                              />
                            </div>
                            <textarea
                              value={exp.description}
                              onChange={(e) =>
                                handleExperienceUpdate(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Job description and achievements..."
                              rows={3}
                              className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 resize-none"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-lg">
                                {exp.title}
                              </h4>
                              <span className="text-sm text-gray-400">
                                {exp.duration}
                              </span>
                            </div>
                            <p className="text-[#00FFB2] mb-2">{exp.company}</p>
                            <p className="text-gray-300 text-sm">
                              {exp.description}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase
                        size={48}
                        className="text-gray-500 mx-auto mb-4"
                      />
                      <p className="text-gray-400 mb-4">
                        No experience added yet
                      </p>
                      {isEditing && (
                        <button
                          onClick={handleExperienceAdd}
                          className="btn-outline"
                        >
                          Add Your First Experience
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Education Section */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <GraduationCap size={24} className="text-[#00FFB2]" />
                    Education
                  </h3>
                  {isEditing && (
                    <button
                      onClick={handleEducationAdd}
                      className="btn-outline py-1 px-3 text-sm flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Education
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {profileData.education.length > 0 ? (
                    profileData.education.map((edu, index) => (
                      <div
                        key={index}
                        className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-600"
                      >
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">
                                Education {index + 1}
                              </h4>
                              <button
                                onClick={() => handleEducationRemove(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                value={edu.degree}
                                onChange={(e) =>
                                  handleEducationUpdate(
                                    index,
                                    "degree",
                                    e.target.value
                                  )
                                }
                                placeholder="Degree (e.g., Bachelor of Computer Science)"
                                className="bg-[#0A0A0A] border border-gray-700"
                              />
                              <Input
                                value={edu.institution}
                                onChange={(e) =>
                                  handleEducationUpdate(
                                    index,
                                    "institution",
                                    e.target.value
                                  )
                                }
                                placeholder="Institution Name"
                                className="bg-[#0A0A0A] border border-gray-700"
                              />
                              <Input
                                value={edu.year}
                                onChange={(e) =>
                                  handleEducationUpdate(
                                    index,
                                    "year",
                                    e.target.value
                                  )
                                }
                                placeholder="Year (e.g., 2020-2024)"
                                className="bg-[#0A0A0A] border border-gray-700"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-lg">
                                {edu.degree}
                              </h4>
                              <span className="text-sm text-gray-400">
                                {edu.year}
                              </span>
                            </div>
                            <p className="text-[#00FFB2]">{edu.institution}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <GraduationCap
                        size={48}
                        className="text-gray-500 mx-auto mb-4"
                      />
                      <p className="text-gray-400 mb-4">
                        No education added yet
                      </p>
                      {isEditing && (
                        <button
                          onClick={handleEducationAdd}
                          className="btn-outline"
                        >
                          Add Your Education
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Career Goals Section */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Target size={24} className="text-[#00FFB2]" />
                  Career Goals
                </h3>
                {isEditing ? (
                  <textarea
                    value={profileData.goals}
                    onChange={(e) => handleInputChange("goals", e.target.value)}
                    placeholder="Describe your career aspirations and goals..."
                    rows={4}
                    className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 resize-none"
                  />
                ) : profileData.goals ? (
                  <div className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-600">
                    <p className="text-gray-300 leading-relaxed">
                      {profileData.goals}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target size={48} className="text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">
                      No career goals set yet
                    </p>
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
                  <Award size={24} className="text-[#00FFB2]" />
                  Profile Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#1A1A1A] p-4 rounded-lg text-center">
                    <div className="text-[#00FFB2] text-2xl font-bold">
                      {Math.round(
                        (((profileData.name ? 1 : 0) +
                          (profileData.phone ? 1 : 0) +
                          (profileData.location ? 1 : 0) +
                          (profileData.linkedinProfile ? 1 : 0) +
                          (profileData.goals ? 1 : 0) +
                          (profileData.skills.length > 0 ? 1 : 0) +
                          (profileData.experience.length > 0 ? 1 : 0) +
                          (profileData.education.length > 0 ? 1 : 0) +
                          (uploadedResume ? 1 : 0)) /
                          9) *
                          100
                      )}
                      %
                    </div>
                    <div className="text-sm text-gray-400">
                      Profile Completion
                    </div>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-lg text-center">
                    <div className="text-[#00FFB2] text-2xl font-bold">
                      {profileData.skills.length}
                    </div>
                    <div className="text-sm text-gray-400">Skills</div>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-lg text-center">
                    <div className="text-[#00FFB2] text-2xl font-bold">
                      {profileData.experience.length}
                    </div>
                    <div className="text-sm text-gray-400">Experience</div>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-lg text-center">
                    <div className="text-[#00FFB2] text-2xl font-bold">
                      {profileData.education.length}
                    </div>
                    <div className="text-sm text-gray-400">Education</div>
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
