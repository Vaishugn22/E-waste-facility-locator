import React, { useState, ChangeEvent } from "react";
import Link from "next/link";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { SERVER } from '../utils/SERVER'; 
import withAuthRedirect from '../components/withAuthRedirect';

const Signin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const login = async () => {
    toast.loading("Authenticating...");
    try {
      const response = await axios.post(
        `${SERVER}/api/auth/login`, // Adjust to your backend URL
        formData
      );

      toast.dismiss();
      const user = response.data;
      console.log("User:", user);

      // Save user details to localStorage or state
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login Successful!");

      // Redirect to home page
      window.location.href = "/";
    } catch (error: any) {
      toast.dismiss();
      console.error("Login failed:", error);
      toast.error(error.response?.data?.error || "Login failed.");
    }
  };

  return (
    <div className="flex items-center justify-center md:h-screen h-[70vh]">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
        <div className="flex flex-col justify-center p-8 md:p-14">
          <span className="mb-3 text-4xl font-bold">Welcome back</span>
          <span className="font-light text-gray-400 mb-8">
            Welcome back! Please enter your details
          </span>
          <div className="py-4">
            <span className="mb-2 text-md">Email</span>
            <input
              type="text"
              name="email"
              placeholder="Enter your email"
              className="w-full p-2 sign-field rounded-md placeholder:font-light placeholder:text-gray-500"
              onChange={handleInputChange}
              value={formData.email}
            />
          </div>
          <div className="py-4">
            <span className="mb-2 text-md">Password</span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              className="w-full p-2 sign-field rounded-md placeholder:font-light placeholder:text-gray-500"
              onChange={handleInputChange}
              value={formData.password}
            />
          </div>
          <div className="flex justify-between w-full py-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                onClick={togglePasswordVisibility}
                className="mr-2"
              />
              Show Password
            </label>
            <Link href="/forget-password" className="font-bold text-black">
              Forgot password?
            </Link>
          </div>
          <button
            className="w-full bg-black text-white p-2 rounded-lg hover:bg-emerald-400 hover:text-black"
            onClick={login}
          >
            Sign in
          </button>
          <div className="text-center text-gray-400">
            Don’t have an account?{" "}
            <Link href="/sign-up" className="font-bold text-black hover:text-emerald-300">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
