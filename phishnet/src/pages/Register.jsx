import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../component/ui/input";
import { Button } from "../component/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../component/ui/card";
import { Lock, Mail, User } from "lucide-react";
import logo from "../assets/img/Logo/logo.jpg";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    console.log("User Registered:", { name, email, password });
    navigate("/login");
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">
      <div className="relative w-full max-w-md p-1 rounded-xl bg-[#131313] shadow-2xl">
        <Card className="bg-[#1A1A1A] text-white border border-gray-800/50 shadow-lg rounded-xl backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 p-1">
                <img src={logo} alt="Logo" className="w-full h-full rounded-full object-cover border-2 border-blue-500/30 shadow-lg" />
              </div>
              <CardTitle className="text-center text-2xl mt-2 text-white">Create Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="text-gray-300 text-sm block mb-2">Full Name</label>
                <Input type="text" placeholder="Enter your name" className="bg-[#1a1a1a] text-white border-gray-700/50 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-2">Email Address</label>
                <Input type="email" placeholder="Enter your email" className="bg-[#1a1a1a] text-white border-gray-700/50 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-2">Password</label>
                <Input type="password" placeholder="Create a password" className="bg-[#1a1a1a] text-white border-gray-700/50 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-blue-500/50">
                Register
              </Button>
            </form>
            <p className="text-center text-gray-400 mt-4 text-sm">
              Already have an account? <span className="text-blue-500 hover:underline cursor-pointer" onClick={() => navigate("/login")}>Login</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
