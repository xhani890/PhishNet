import React, { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Mail } from "lucide-react";
import resetService from "../services/auth/resetService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import logo from "../assets/img/Logo/logo.jpg"; // ✅ Ensure correct import

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowPopup(true); // ✅ Show popup immediately

    try {
      await resetService.requestPasswordReset(email);
      toast.success("If the email exists, a reset link has been sent.");
      
      setTimeout(() => {
        setShowPopup(false);
        setEmail(""); // ✅ Clear input
        navigate("/login", { replace: true }); // ✅ Redirect properly
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link.");
      setShowPopup(false); // Hide popup on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">
      {/* Forgot Password Card */}
      <div className="relative w-full max-w-md p-1 rounded-xl bg-[#131313] shadow-2xl">
        <Card className="bg-[#1A1A1A] text-white border border-gray-800/50 shadow-lg rounded-xl backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mb-4 p-1">
                <img src={logo} alt="Logo" className="w-full h-full rounded-full object-cover border-2 border-orange-500/30 shadow-lg" />
              </div>
              <CardTitle className="text-center text-2xl mt-2 text-white">Forgot Password?</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetRequest} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="text-gray-300 text-sm block mb-2">Email Address</label>
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

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 transition-all duration-300 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-orange-500/50"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            {/* Back to Login Link */}
            <p className="text-center text-gray-400 mt-4 text-sm">
              <span className="text-orange-500 hover:underline cursor-pointer" onClick={() => navigate("/login")}>
                Back to Login
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Fancy Confirmation Popup (Fixed & Shows Immediately) */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#1A1A1A] text-white p-6 rounded-lg shadow-lg text-center border border-orange-500/50">
            <h3 className="text-lg">📩 Reset Link Sent</h3>
            <p className="text-gray-400 text-sm mt-2">
              If this email exists, a reset link has been sent. <br /> Check your inbox (or spam folder).
            </p>
            <Button className="mt-4 bg-orange-500 w-full" onClick={() => setShowPopup(false)}>
              Got it!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
