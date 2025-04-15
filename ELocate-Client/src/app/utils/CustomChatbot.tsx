"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { SERVER } from './SERVER'; 

const CustomChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [userInput, setUserInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for the bottom of the messages container

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);

    const userMessage = userInput;
    setUserInput(""); // Clear input field

    try {
      const response = await axios.post(`${SERVER}/api/chatbot`, {
        user: "User",
        message: userMessage,
      });
      const botReply = response.data.reply;

      // Add bot's reply to chat
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Oops! Something went wrong. Please try again." },
      ]);
    }
  };

  // Scroll to the last message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom(); // Call scrollToBottom whenever messages update
  }, [messages]);

  return (
    <div>
      {/* Floating Icon */}
      {!isOpen && (
        <div
          onClick={toggleChatbot}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "60px",
            height: "60px",
            backgroundColor: "#28af60",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            fontSize: "24px",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          💬
        </div>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "300px",
            height: "400px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            backgroundColor: "#fff", // Solid white background
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            zIndex: 1000, // Ensure it is above other elements
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px",
              backgroundColor: "#28af60",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Chat with us</span>
            <button
              onClick={toggleChatbot}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  backgroundColor:
                    msg.sender === "user" ? "#28af60" : "#f0f0f0",
                  color: msg.sender === "user" ? "#fff" : "#000",
                  padding: "10px",
                  borderRadius: "10px",
                  maxWidth: "70%",
                }}
              >
                {msg.text}
              </div>
            ))}
            {/* Reference for scrolling */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              padding: "10px",
              borderTop: "1px solid #ccc",
              backgroundColor: "#fff", // Ensure consistent white background
            }}
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                marginRight: "10px",
                outline: "none",
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28af60",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomChatbot;
