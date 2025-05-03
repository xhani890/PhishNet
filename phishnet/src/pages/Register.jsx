import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Mail, Lock, User, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react"; // ✅ Icons
import logo from "../assets/img/Logo/logo.png"; // ✅ Ensure correct import
import authService from "../services/auth/authService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(""); // ✅ Password strength tracking
  const [showPassword, setShowPassword] = useState(false); // ✅ Toggle password visibility
  const [passwordsMatch, setPasswordsMatch] = useState(true); // ✅ Track password match
  const [confirmTouched, setConfirmTouched] = useState(false); // ✅ Track if confirm password field has been touched

  const navigate = useNavigate();

  // ✅ Real-time password validation
  const validatePassword = (pwd) => {
    const lengthValid = pwd.length >= 8;
    const hasNumber = /\d/.test(pwd);
    const hasUppercase = /[A-Z]/.test(pwd);

    if (lengthValid && hasNumber && hasUppercase) {
      setPasswordStrength("strong");
    } else if (lengthValid) {
      setPasswordStrength("weak");
    } else {
      setPasswordStrength("invalid");
    }
  };

  // ✅ Real-time confirm password match check (only shows message if user has typed something)
  const checkPasswordMatch = (confirmPwd) => {
    setConfirmPassword(confirmPwd);
    setPasswordsMatch(password === confirmPwd);
    setConfirmTouched(confirmPwd.length > 0); // ✅ Only show message if field is not empty
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (passwordStrength !== "strong") {
      setError("Your password is too weak. Use at least 8 characters, a number & an uppercase letter.");
      setLoading(false);
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match. Please try again.");
      setLoading(false);
      return;
    }

    try {
      await authService.register(name, email, password);
      toast.success("🎉 Account created! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      toast.error("⚠️ Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">
      <div className="relative w-full max-w-md p-1 rounded-xl bg-[#131313] shadow-2xl">
        <Card className="bg-[#1A1A1A] text-white border border-gray-800/50 shadow-lg rounded-xl backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mb-4 p-1">
                <img src={logo} alt="Logo" className="w-full h-full rounded-full object-cover border-2 border-orange-500/30 shadow-lg" />
              </div>
              <CardTitle className="text-center text-2xl mt-2 text-white">Create Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              {/* Full Name Field */}
              <div>
                <label className="text-white-400 text-sm block mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    className="pl-10 bg-[#1a1a1a] text-white border border-gray-700/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="text-white-400 text-sm block mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 bg-[#1a1a1a] text-white border border-gray-700/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="text-white-400 text-sm block mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pl-10 pr-10 bg-[#1a1a1a] text-white border border-gray-700/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validatePassword(e.target.value);
                    }}
                    required
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="text-white-400 text-sm block mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    className="pl-10 bg-[#1a1a1a] text-white border border-gray-700/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                    value={confirmPassword}
                    onChange={(e) => checkPasswordMatch(e.target.value)}
                    required
                  />
                </div>
                {confirmTouched && !passwordsMatch && (
                  <p className="text-xs text-red-400 mt-1">❌ Passwords do not match.</p>
                )}
              </div>

              {/* ✅ Register Button (Now Fixed) */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 transition-all duration-300 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-orange-500/50"
              >
                {loading ? "Creating Account..." : "Register"}
              </Button>

              {/* ✅ Login Option (Now Fixed) */}
              <p className="text-center text-gray-400 mt-4 text-sm">
                Already have an account?{" "}
                <span className="text-orange-500 hover:underline cursor-pointer" onClick={() => navigate("/login")}>
                  Login
                </span>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
