"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import AddItem from "./AddItem";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!userStr) {
      toast.error("Please login or signup before adding a product.", {
        autoClose: 3000,
      });
      router.push("/Catalog");
    }
  }, [router]);

  return (
    <div>
      <AddItem/>
    </div>
  );
};

export default Page;
