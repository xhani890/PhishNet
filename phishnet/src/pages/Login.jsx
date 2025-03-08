import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../component/ui/input";
import { Button } from "../component/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../component/ui/card";
import { Lock, Mail } from "lucide-react";
import logo from "../assets/img/Logo/logo.jpg";

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "admin@example.com" && password === "password") {
      setIsAuthenticated(true);
      navigate("/");
    } else {
      setError("Invalid email or password!");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">
      {/* Background Circuit Design */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 opacity-30">
          <svg viewBox="0 0 320 320" className="w-full h-full">
            <path d="M0 0 L100 0 Q150 50, 100 100 L0 100 Z" fill="none" stroke="rgba(50,180,255,0.2)" strokeWidth="2" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-80 h-80 opacity-30 rotate-180">
          <svg viewBox="0 0 320 320" className="w-full h-full">
            <path d="M0 0 L100 0 Q150 50, 100 100 L0 100 Z" fill="none" stroke="rgba(50,180,255,0.2)" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md p-1 rounded-xl bg-[#131313] shadow-2xl">
        <Card className="bg-[#1a1a1a] text-white border border-gray-800/50 shadow-lg rounded-xl backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 p-1">
                <img src={logo} alt="Logo" className="w-full h-full rounded-full object-cover border-2 border-blue-500/30 shadow-lg" />
              </div>
              <CardTitle className="text-center text-2xl mt-2 text-white">Welcome Back</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <div>
                <label className="text-gray-300 text-sm block mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <Input type="email" placeholder="Enter your email" className="pl-10 bg-[#1a1a1a] text-white border-gray-700/50 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <Input type="password" placeholder="Enter your password" className="pl-10 bg-[#1a1a1a] text-white border-gray-700/50 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-blue-500/50">
                Login
              </Button>
            </form>
            <p className="text-center text-gray-400 mt-4 text-sm">
              Don't have an account? <span className="text-blue-500 hover:underline cursor-pointer" onClick={() => navigate("/register")}>Register</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
