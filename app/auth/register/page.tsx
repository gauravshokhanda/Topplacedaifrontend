"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Eye, EyeOff, User, Briefcase } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    name: "",
    experience: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Auto redirect if already logged in
  useEffect(() => {
    if (token && user) {
      if (user.role === "mentor") router.replace("/mentor");
      else router.replace("/learner");
    }
  }, [token, user, router]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // const handleSubmit = async (e: any) => {
  //   e.preventDefault();
  //   setMessage("");
  //   setLoading(true);

  //   if (form.password !== form.confirmPassword) {
  //     setMessage("Passwords don't match.");
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     const res = await fetch("http://localhost:4000/auth/register", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         email: form.email,
  //         password: form.password,
  //         role: form.role,
  //         name:  form.name,
  //         experience: form.role === "mentor" ? form.experience : undefined,
  //       }),
  //     });

  //     const data = await res.json();

  //     if (data.success && data.token && data.user) {
  //       // ✅ Save to Redux
  //       dispatch(loginSuccess({ token: data.token, user: data.user }));
  //       // ✅ Redirect
  //       if (data.user.role === "mentor") router.push("/mentor");
  //       else router.push("/learner");
  //     } else {
  //       setMessage(data.message || "Something went wrong.");
  //     }
  //   } catch (err) {
  //     setMessage("Server error.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords don't match.");
      toast.error("Passwords don't match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          experience: form.role === "mentor" ? form.experience : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.access_token && data.user) {
        const token = data.access_token;
        const user = data.user;

        // ✅ Same Redux + localStorage logic as LoginPage
        localStorage.setItem("token", token);
        dispatch(loginSuccess({ token, user }));

        setMessage("Account created successfully! Redirecting...");
        toast.success("Account created successfully! Redirecting...");

        // ✅ Redirect
        if (user.role === "mentor") {
          router.push("/mentor");
        } else {
          router.push("/learner");
        }
      } else {
        setMessage(data.message || "Something went wrong.");
        toast.error(data.message || "Registration failed.");
      }
    } catch (error) {
      setMessage("Server error.");
      toast.error("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#00FFB2]/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00CC8E]/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card p-8 neon-glow">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-1">Create Account</h1>
            <p className="text-gray-400 text-sm">
              Join and grow your career journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-gray-300 text-sm">Full Name</label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  name="name"
                  type="text"
                  className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            {/* Email */}
            <div>
              <label className="text-gray-300 text-sm">Email</label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  name="email"
                  type="email"
                  className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-300 text-sm">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white"
                  placeholder="Create password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-gray-300 text-sm">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="text-gray-300 text-sm">Role</label>
              <select
                name="role"
                className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white"
                value={form.role}
                onChange={handleChange}
              >
                <option value="user">Interviewer </option>
                <option value="mentor">Mentor</option>
              </select>
            </div>

            {/* Mentor Fields */}
            {form.role === "mentor" && (
              <>
                <div>
                  <label className="text-gray-300 text-sm">Experience</label>
                  <div className="relative">
                    <Briefcase
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      name="experience"
                      type="text"
                      className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white"
                      placeholder="e.g. 3 years in full stack"
                      value={form.experience}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 font-semibold disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            {message && (
              <p className="text-sm text-center mt-2 text-red-400">{message}</p>
            )}
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-[#00FFB2] hover:underline font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
