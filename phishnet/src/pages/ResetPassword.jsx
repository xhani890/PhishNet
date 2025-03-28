import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Lock, Eye, EyeOff } from "lucide-react";
import logo from "../assets/img/Logo/logo.jpg";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [token, setToken] = useState(null);
  const [reuseError, setReuseError] = useState(""); // ✅ Store reuse message
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tokenFromURL = searchParams.get("token");
    if (!tokenFromURL) {
      toast.error("⚠ Invalid or missing reset token!");
      navigate("/login");
      return;
    }
    setToken(tokenFromURL);

    // ✅ Verify Token Validity Immediately
    axios
      .post("http://localhost:5000/api/auth/validate-token", { token: tokenFromURL })
      .then((response) => {
        if (!response.data.valid) {
          toast.error("⚠ This reset link has expired or has already been used!");
          navigate("/login");
        }
      })
      .catch(() => {
        toast.error("⚠ Invalid or expired token!");
        navigate("/login");
      });
  }, [searchParams, navigate]);

  const validatePassword = (pwd) => {
    setNewPassword(pwd);
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

  const checkPasswordMatch = (confirmPwd) => {
    setConfirmPassword(confirmPwd);
    setPasswordsMatch(newPassword === confirmPwd);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (passwordStrength !== "strong") {
      toast.error("⚠ Password is too weak!");
      return;
    }

    if (!passwordsMatch) {
      toast.error("⚠ Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/reset-password", {
        token,
        newPassword,
      });

      toast.success(response.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Reset failed. Try again!";

      if (errorMessage.includes("same password")) {
        setReuseError("⚠ You cannot use the same password as before!"); // ✅ Set message
        setTimeout(() => setReuseError(""), 2000); // ✅ Hide after 2 seconds
      } else {
        toast.error(errorMessage);
      }
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
              <CardTitle className="text-center text-2xl mt-2 text-white">Reset Your Password</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* ✅ Show Reuse Message */}
            {reuseError && <p className="text-red-500 text-sm text-center mb-3">{reuseError}</p>}

            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* Password Field */}
              <div>
                <label className="text-white-400 text-sm block mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="pl-10 pr-10 bg-[#1a1a1a] text-white border border-gray-700/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                    value={newPassword}
                    onChange={(e) => validatePassword(e.target.value)}
                    required
                  />
                  {newPassword && (
                    <span
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-orange-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 ${passwordStrength === "strong" ? "text-green-400" : "text-red-400"}`}>
                  {passwordStrength === "strong"
                    ? "✔ Secure password!"
                    : "⚠ Use at least 8 characters, a number & an uppercase letter."}
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="text-white-400 text-sm block mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    className="pl-10 bg-[#1a1a1a] text-white border border-gray-700/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                    value={confirmPassword}
                    onChange={(e) => checkPasswordMatch(e.target.value)}
                    required
                  />
                  {confirmPassword && (
                    <span
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-orange-500"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </span>
                  )}
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-400 mt-1">❌ Passwords do not match.</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 transition-all duration-300 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-orange-500/50"
              >
                Reset Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
