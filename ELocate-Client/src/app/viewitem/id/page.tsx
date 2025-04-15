"use client";
import React from "react";
import { motion } from "framer-motion";
import ViewItem from "../ViewItem";

const Page = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 p-8 pt-15" // Added `pt-28` for spacing
    >
      
      <div className="md:mt-0 mt-8 pt-8">
      <ViewItem />
        </div>
    </motion.div>
  );
};

export default Page;
