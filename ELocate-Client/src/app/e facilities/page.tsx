"use client";
import React from "react";
import { motion } from "framer-motion";
import FacilityMap from "./Efacility";

const Page = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-start min-h-screen pt-0" // Adjusted to move more upwards
      >
        <div className="w-full">
          <FacilityMap />
        </div>
      </motion.div>
    </>
  );
};

export default Page;
