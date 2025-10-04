import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { loginUser } from "../../api"; 
import { useAuth } from "../../context/AuthContext"; 

export function SignIn() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, login } = useAuth(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
  
    try {
      const response = await loginUser(formData);
      console.log("Login Response:", response);
  
      if (!response || !response.user) {
        setError(response.message || "Invalid credentials");
        return;
      }
  
      // Fetch the latest session data to ensure the role is correct
      const sessionResponse = await fetch("http://localhost:5000/api/auth/me", { credentials: "include" });
      const sessionData = await sessionResponse.json();
  
      if (!sessionData.user) {
        setError("Failed to verify session. Please try again.");
        return;
      }
  
      login(sessionData.user); // Update global auth state with verified backend data
  
      // Redirect based on the verified role from backend
      const role = sessionData.user.role?.toLowerCase();
      console.log("Verified User Role:", role);
  
      if (role === "donor") navigate("/donor-dashboard");
      else if (role === "ngo") navigate("/ngo-dashboard");
      else if (role === "volunteer") navigate("/volunteer-dashboard");
      else if (role === "admin") navigate("/admin-dashboard");
      else navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };
  

  return (
    <div className="min-h-screen pt-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto glass-card p-8 rounded-2xl relative"
      >
        <div className="gradient" />
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-3 py-2 rounded-lg border bg-white/50"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              className="w-full px-3 py-2 rounded-lg border bg-white/50"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link to="/sign-up" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
