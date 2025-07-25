"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Image from "next/image";
import { Pencil, Mail, Phone, Briefcase, Star } from "lucide-react";

export default function LearnerProfilePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    experience: user?.experience || "",
    goals: user?.goals || "",
    resumeFile: null as File | null,
    profileImageFile: null as File | null,
  });

  useEffect(() => {
    setIsVisible(true);
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
                Your Profile
              </h1>
              <p className="text-gray-400 text-lg">
                Review and manage your personal and career information
              </p>
            </div>

            <div className="glass-card p-8 neon-glow">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Image
                  src={user?.profile_image || "/images/user-placeholder.png"}
                  alt="Profile"
                  width={100}
                  height={100}
                  className="rounded-full border border-[#00FFB2]"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">
                      {user?.name || "John Doe"}
                    </h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn-outline py-1 px-3 text-sm flex items-center gap-1"
                      >
                        <Pencil size={16} /> Edit
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className="input"
                      />
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone"
                        className="input"
                      />
                      <input
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        placeholder="Experience"
                        className="input"
                      />
                      <textarea
                        name="goals"
                        value={formData.goals}
                        onChange={handleInputChange}
                        placeholder="Career Goals"
                        className="input"
                      />
                      <div>
                        <label className="text-sm text-white">
                          Profile Picture:
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-white">Resume:</label>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handleResumeChange}
                        />
                        {formData.resumeFile && (
                          <iframe
                            src={URL.createObjectURL(formData.resumeFile)}
                            className="w-full h-32 mt-2 rounded border"
                          />
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handleSave} className="btn-primary">
                          Save
                        </button>
                        <button onClick={handleCancel} className="btn-outline">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center text-sm text-gray-400 gap-2">
                        <Mail size={16} /> {user?.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-400 gap-2">
                        <Phone size={16} /> {user?.phone || "Not added"}
                      </div>
                      <div className="flex items-center text-sm text-gray-400 gap-2">
                        <Briefcase size={16} />{" "}
                        {user?.experience || "No experience added"}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {!isEditing && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <div className="bg-[#1A1A1A] p-4 rounded-lg text-center">
                    <div className="text-[#00FFB2] text-2xl font-bold">
                      {user?.profile_completion || 0}%
                    </div>
                    <div className="text-sm text-gray-400">
                      Profile Completion
                    </div>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-lg text-center">
                    <div className="text-[#00FFB2] text-2xl font-bold">
                      {user?.tech_stack || "-"}
                    </div>
                    <div className="text-sm text-gray-400">Tech Stack</div>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-lg text-center">
                    <div className="text-yellow-400 text-2xl font-bold">
                      4.5
                    </div>
                    <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
                      <Star size={14} /> Average Rating
                    </div>
                  </div>
                </div>
              )}

              {!isEditing && (
                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-1 text-white">
                      Career Goals
                    </h3>
                    <p className="text-sm text-gray-300">
                      {user?.goals ||
                        "You haven’t added your career goals yet."}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-white">Resume</h3>
                    {user?.resume_url ? (
                      <a
                        href={user.resume_url}
                        target="_blank"
                        className="text-sm text-[#00FFB2] underline"
                      >
                        View Uploaded Resume
                      </a>
                    ) : (
                      <p className="text-sm text-gray-300">
                        No resume uploaded.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
