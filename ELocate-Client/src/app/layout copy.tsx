import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import dynamic from "next/dynamic";
import NextTopLoader from "nextjs-toploader";
import Navbar from "./Header/Navbar";
import Footer from "./Footer/Footer";

// Dynamically import the CustomChatbot
const CustomChatbot = dynamic(() => import("./utils/CustomChatbot"), {
  ssr: false, // Disable server-side rendering
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: "500",
});

export const metadata: Metadata = {
  title: "ELocate",
  description: "ELocate - One stop solution to Recycle E-Waste, E-waste Facility Locator",
};

// Suppress Hydration Warnings or Errors
if (typeof window !== "undefined") {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes("hydration failed")) {
      return; // Suppress hydration-related errors
    }
    originalConsoleError(...args);
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="/favicon.ico?<generated>"
          type="image/png"
          sizes="32x32"
        />
      </head>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-5QLTMJKRNP"
      ></Script>
      <Script
        id="google-analytics"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5QLTMJKRNP');
            `,
        }}
      />
      <body className={poppins.className}>
        <NextTopLoader color="#28af60" showSpinner={false} />
        <Navbar />
        {children}
        <Footer />
        <CustomChatbot /> {/* Add chatbot here */}
      </body>
    </html>
  );
}
