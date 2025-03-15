import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Lock, Mail } from "lucide-react";
import logo from "../assets/img/Logo/logo.jpg";
import authService from "../services/auth/authService"; // 🔗 API Service
import { toast } from "react-toastify"; // 📢 Notifications
import "react-toastify/dist/ReactToastify.css"; // 📢 Toastify Styles

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false); // 📌 Remember Me Feature
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(email, password); // 🔗 API Request
      localStorage.setItem("authToken", response.token); // 🔐 Store JWT
      setIsAuthenticated(true);
      toast.success("Login successful! Redirecting..."); // 📢 Success Notification
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
      toast.error("Login failed! Please check credentials."); // 📢 Error Notification
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">
      {/* Login Card */}
      <div className="relative w-full max-w-md p-1 rounded-xl bg-[#131313] shadow-2xl">
        <Card className="bg-[#1A1A1A] text-white border border-gray-800/50 shadow-lg rounded-xl backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mb-4 p-1">
                <img src={logo} alt="Logo" className="w-full h-full rounded-full object-cover border-2 border-orange-500/30 shadow-lg" />
              </div>
              <CardTitle className="text-center text-2xl mt-2 text-white">Welcome Back</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              
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
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10 bg-[#1a1a1a] text-white border border-gray-700/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Remember Me & Login Button */}
              <div className="flex items-center justify-between">
                <label className="text-orange-400 text-sm flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 w-4 h-4 accent-orange-500 focus:ring-2 focus:ring-orange-500"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  Remember Me
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 transition-all duration-300 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-orange-500/50"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <p className="text-center text-gray-400 mt-4 text-sm">
              Don&apos;t have an account?{" "}
              <span className="text-orange-500 hover:underline cursor-pointer" onClick={() => navigate("/register")}>
                Register
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

Login.propTypes = {
  setIsAuthenticated: PropTypes.func.isRequired,
};

export default Login;
