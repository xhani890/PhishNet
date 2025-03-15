import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import logo from "../assets/img/Logo/logo.jpg";
import { CheckCircle, XCircle } from "lucide-react"; // ✅ Icons for password validation
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

  const navigate = useNavigate();

  // ✅ Check password strength in real-time
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (passwordStrength !== "strong") {
      setError("Your password is too weak. Please use at least 8 characters, a number & an uppercase letter.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
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

              <div>
                <label className="text-gray-300 text-sm block mb-2">Full Name</label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  className="bg-[#1a1a1a] text-white border border-orange-500 focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm block mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-[#1a1a1a] text-white border border-orange-500 focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm block mb-2">Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Create a password"
                    className="bg-[#1a1a1a] text-white border border-orange-500 focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validatePassword(e.target.value);
                    }}
                    required
                  />
                  {/* ✅ Live Password Strength Indicator */}
                  {password && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {passwordStrength === "strong" ? (
                        <CheckCircle className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {/* ✅ Password Complexity Message */}
                <p className={`text-xs mt-1 ${passwordStrength === "strong" ? "text-green-400" : "text-red-400"}`}>
                  {passwordStrength === "strong"
                    ? "✔ Secure password!"
                    : "⚠ Use at least 8 characters, a number & an uppercase letter."}
                </p>
              </div>

              <div>
                <label className="text-gray-300 text-sm block mb-2">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Re-enter password"
                  className="bg-[#1a1a1a] text-white border border-orange-500 focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 transition-all duration-300 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-orange-500/50"
              >
                {loading ? "Creating Account..." : "Register"}
              </Button>
            </form>
            <p className="text-center text-gray-400 mt-4 text-sm">
              Already have an account?{" "}
              <span className="text-orange-500 hover:underline cursor-pointer" onClick={() => navigate("/login")}>
                Login
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
