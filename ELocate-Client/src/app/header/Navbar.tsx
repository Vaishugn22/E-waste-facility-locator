"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IonIcon } from "@ionic/react";
import { menuOutline, location } from "ionicons/icons";
import logo from "../../assets/ELocate-s.png";
import { getUser, handleLogout } from "../sign-in/auth";
import { SERVER } from "../utils/SERVER";

interface NavItemProps {
  label: string;
  link?: string; // Optional link for custom navigation
}

const Header = () => {
  const [isNavbarActive, setIsNavbarActive] = useState(false);
  const [isHeaderActive, setIsHeaderActive] = useState(false);
  const [locations, setLocation] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [creditPoints, setCreditPoints] = useState<number>(0);

  const user = getUser();

  const fetchCreditPoints = async () => {
    if (user) {
      try {
        const response = await fetch(`${SERVER}/api/get_credits/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setCreditPoints(data.creditPoints || 0);
        } else {
          console.error("Failed to fetch credit points.");
        }
      } catch (error) {
        console.error("Error fetching credit points:", error);
      }
    }
  };

  useEffect(() => {
    document.documentElement.classList.remove("no-js");

    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=pk.eyJ1Ijoic2h1ZW5jZSIsImEiOiJjbG9wcmt3czMwYnZsMmtvNnpmNTRqdnl6In0.vLBhYMBZBl2kaOh1Fh44Bw`
          )
            .then((response) => response.json())
            .then((data) => {
              const city = data.features[0]?.context.find((context: any) =>
                context.id.includes("place")
              )?.text;
              const state = data.features[0]?.context.find((context: any) =>
                context.id.includes("region")
              )?.text;
              setLocation(`${city}, ${state}`);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        },
        (error) => {
          console.error(error);
        },
        options
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderActive(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    fetchCreditPoints();
  }, []);

  const toggleNavbar = () => {
    setIsNavbarActive(!isNavbarActive);
  };

  const logout = () => {
    handleLogout();
    localStorage.clear();
    window.location.href = "/"; // Redirect to home page or sign-in page
  };

  const handleDropdownMouseEnter = () => {
    setIsDropdownOpen(true);
    // Refresh credits when hovering over the username
    fetchCreditPoints();
  };

  const handleDropdownMouseLeave = () => {
    setIsDropdownOpen(false);
  };

  return (
    <header
      style={{
        backgroundColor: "#f9f9f9",
        boxShadow: isHeaderActive ? "0 4px 6px rgba(0, 0, 0, 0.2)" : "none",
        transition: "box-shadow 0.3s ease-in-out",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Logo */}
        <Link href="/">
          <Image src={logo} alt="ELocate" width={80} height={80} />
        </Link>

        {/* Visible Tabs */}
        <nav style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <NavItem label="Home" />
          <NavItem label="About" />
          <NavItem label="E_Facilities" link="/e-facilities" />
          <NavItem label="Recycle" />
        </nav>

        {/* Hamburger Menu */}
        <div style={{ position: "relative" }}>
          <button
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
            }}
            onClick={toggleNavbar}
          >
            <IonIcon icon={menuOutline} />
          </button>

          <nav
            style={{
              display: isNavbarActive ? "block" : "none",
              position: "absolute",
              top: "100%",
              right: 0,
              backgroundColor: "white",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              padding: "10px",
              borderRadius: "8px",
              zIndex: 1000,
              width: "200px", // Ensure consistent width
            }}
            onMouseLeave={() => setIsNavbarActive(false)}
          >
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "block",
              }}
            >
              <NavItem label="Education" />
              <NavItem label="Contact Us" link="/contactus" />
              <NavItem label="Rules" />
              <NavItem label="AI E-Waste Analyzer" link="/EAnalyzer" />
              <NavItem label="Reusable Electronics" link="/Catalog" />
            </ul>
          </nav>
        </div>

        {/* Location and Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h1
            style={{
              fontSize: "14px",
              color: "#28af60",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <IonIcon icon={location} /> {locations || "Loading..."}
          </h1>

          {user ? (
            <div
              style={{ position: "relative" }}
              onMouseEnter={handleDropdownMouseEnter}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <button
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                {user.username.charAt(0).toUpperCase() + user.username.slice(1)}
              </button>
              {isDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    backgroundColor: "white",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    zIndex: 1000,
                    width: "150px", // Widen the dropdown for better layout
                  }}
                >
                  <div
                    style={{
                      color: "#333",
                      fontSize: "14px",
                      marginBottom: "8px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Credits: {creditPoints}
                  </div>
                  <button
                    onClick={logout}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#333",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/sign-in"
              style={{
                backgroundColor: "#28af60",
                color: "white",
                padding: "6px 12px",
                borderRadius: "4px",
                textDecoration: "none",
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

const NavItem = ({ label, link }: NavItemProps) => {
  return (
    <li
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid #eee",
        fontSize: "14px",
        textAlign: "center",
        whiteSpace: "nowrap",
      }}
    >
      <Link
        href={link || (label === "Home" ? "/" : `/${label.toLowerCase()}`)}
        style={{ textDecoration: "none", color: "#333" }}
      >
        {label}
      </Link>
    </li>
  );
};

export default Header;
