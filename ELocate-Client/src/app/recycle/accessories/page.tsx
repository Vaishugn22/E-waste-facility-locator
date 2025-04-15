"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Smartphone from "./Accessories";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!userStr) {
      toast.error("Please login or signup before accessing this page.", {
        autoClose: 3000,
      });
      router.push("/recycle");
    }
  }, [router]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="md:mt-20 mt-16 pt-8">
          <Smartphone />
        </div>
      </motion.div>
    </>
  );
};

export default Page;
