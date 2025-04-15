"use client"; // Mark this file as a Client Component

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import NextTopLoader from "nextjs-toploader";

// Dynamically import the CustomChatbot
const CustomChatbot = dynamic(() => import("./utils/CustomChatbot"), {
  ssr: false, // Disable server-side rendering for this component
});

// Suppress Hydration Warnings or Errors
if (typeof window !== "undefined") {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes("hydration failed")) {
      // Suppress hydration-related errors only
      return;
    }
    originalConsoleError(...args);
  };
}

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    // Ensure CustomChatbot renders only after the client loads
    setShowChatbot(true);
  }, []);

  return (
    <>
      <NextTopLoader color="#28af60" showSpinner={false} />
      {children}
      {showChatbot && <CustomChatbot />} {/* Render Chatbot dynamically */}
    </>
  );
}
