"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";
import { FiArrowLeft, FiUser, FiShield } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleGoogleAuth = async () => {
    setIsLoading(true);

    try {
      // Simulate Google OAuth flow
      // In a real app, you would integrate with Google OAuth or NextAuth.js
      console.log("Initiating Google OAuth...");

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate successful authentication
      const userData = {
        id: "google_123",
        name: "John Doe",
        email: "john.doe@gmail.com",
        avatar: "https://via.placeholder.com/40",
      };

      // Use auth context to sign in
      signIn(userData);

      // Redirect to home
      router.push("/");
    } catch (error) {
      console.error("Authentication failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-50"></div>
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full opacity-3 blur-3xl"></div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 flex items-center space-x-2 text-gray-300 hover:text-white transition-colors z-10"
      >
        <FiArrowLeft className="text-xl" />
        <span>Back to Home</span>
      </button>

      {/* Auth Container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-white/10 p-3 rounded-full">
                <FiShield className="text-3xl text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to MathVision AI
            </h1>
            <p className="text-gray-300 text-sm">
              Sign in or create your account to start creating amazing
              mathematical animations
            </p>
          </div>

          {/* Auth Methods */}
          <div className="space-y-4">
            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              ) : (
                <FaGoogle className="text-xl text-red-500" />
              )}
              <span>
                {isLoading ? "Connecting..." : "Continue with Google"}
              </span>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900 text-gray-400">
                  Quick & Secure Authentication
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Create unlimited mathematical animations</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Save and share your projects</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Access advanced AI features</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Export in high-quality formats</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <p className="text-xs text-gray-400">
              By continuing, you agree to our{" "}
              <a href="#" className="text-white hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-white hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            New to MathVision AI? Google sign-in will automatically create your
            account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
