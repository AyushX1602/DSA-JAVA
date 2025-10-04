import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { registerUser } from "../../api"; // Import API function

export function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.role) {
      setError("Please select an account type.");
      return;
    }

    try {
      const response = await registerUser(formData);

      if (response.message === "User registered successfully") {
        navigate("/sign-in"); // Redirect to Sign In page
      } else {
        setError(response.message); // Show error message
      }
    } catch (err) {
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
        <h1 className="text-2xl font-bold mb-6">Create Account</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              className="w-full px-3 py-2 rounded-lg border bg-white/50"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Account Type</label>
            <select
              name="role"
              className="w-full px-3 py-2 rounded-lg border bg-white/50"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select account type</option>
              <option value="donor">Food Donor</option>
              <option value="ngo">NGO</option>
              <option value="volunteer">Volunteer</option>
              <option value="admin">Admin</option>           //adding new feature
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full">Create Account</Button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}


