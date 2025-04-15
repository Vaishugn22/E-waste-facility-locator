"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SERVER } from '../../utils/SERVER';

interface Brand {
  brand: string;
  models: string[];
}

interface BookingData {
  userId: string;
  userEmail: string;
  recycleItem: string;
  recycleItemPrice: number;
  pickupDate: string;
  pickupTime: string;
  facility: string;
  fullName: string;
  address: string;
  type: string;
  phone: number;
}

interface Facility {
  name: string;
  address: string;
  capacity: number;
  lat: number;
  lon: number;
  contact: string;
  time: string;
  verified: boolean;
}

const Television: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  const [recycleItemPrice, setRecycleItemPrice] = useState<number>();
  const [pickupDate, setPickupDate] = useState<string>("");
  const [pickupTime, setPickupTime] = useState<string>("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [address, setAddress] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);

  // Parse user details from localStorage on mount
  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setEmail(userObj.email ?? "");
        setFullName(userObj.fullname ?? "");
        setPhone(userObj.phoneNumber ?? "");
        setType("Television");
        setUserId(userObj.id ? String(userObj.id) : "");
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
      }
    }
  }, []);

  const handleBrandChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = event.target.value;
    setSelectedBrand(brand);
    setSelectedModel("");
    setSelectedFacility("");

    if (brand) {
      const selectedBrandData = brands.find((b) => b.brand === brand);
      if (selectedBrandData) {
        setModels(selectedBrandData.models);
      }
    }
  };

  useEffect(() => {
    const fetchBrandsAndModels = () => {
      const televisionData: Brand[] = [
        {
          brand: "Samsung",
          models: ["QN90A Neo QLED", "TU8000 Crystal UHD", "Frame QLED", "Q70T QLED", "TU8500 Crystal UHD"],
        },
        {
          brand: "LG",
          models: ["C1 OLED", "NanoCell 85", "GX OLED", "UN7300 UHD", "B9 OLED"],
        },
        {
          brand: "Sony",
          models: ["A80J OLED", "X90J Bravia XR", "X800H UHD", "A9G Master Series OLED", "X950H UHD"],
        },
        {
          brand: "TCL",
          models: ["6-Series QLED", "5-Series QLED", "4-Series UHD", "8-Series QLED", "3-Series HD Roku"],
        },
        {
          brand: "Vizio",
          models: ["P-Series Quantum X", "M-Series Quantum", "OLED 4K", "V-Series UHD", "D-Series HD"],
        },
        {
          brand: "Hisense",
          models: ["U8G Quantum", "H9G Quantum", "H8G Quantum", "H65G UHD", "H4G Roku TV"],
        },
        {
          brand: "Panasonic",
          models: ["JX800 UHD", "HX800 UHD", "HZ2000 OLED", "GX800 UHD", "FX800 UHD"],
        },
      ];
      setBrands(televisionData);
    };

    fetchBrandsAndModels();
  }, []);

  // Fetch facilities from API
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch(`${SERVER}/api/facilities`);
        if (response.ok) {
          const data: Facility[] = await response.json();
          setFacilities(data);
        } else {
          console.error("Failed to fetch facilities.");
        }
      } catch (error) {
        console.error("Error fetching facilities:", error);
      }
    };

    fetchFacilities();
  }, []);

  const addCredits = async (userId: number, credits: number) => {
    try {
      const response = await fetch(`${SERVER}/api/add_credits/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ add_credits: credits }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Credits updated successfully:", data);
      } else {
        console.error("Failed to add credits:", await response.text());
      }
    } catch (error: any) {
      console.error("Error adding credits:", error);
    }
  };

  const handleSubmit = async () => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userStr ? JSON.parse(userStr) : null;
    const recycleItem = (selectedBrand && selectedModel) ? `${selectedBrand} ${selectedModel}` : "";

    if (user) {
      if (
        recycleItem.trim() !== "" &&
        selectedFacility.trim() !== "" &&
        (recycleItemPrice !== undefined && !isNaN(recycleItemPrice)) &&
        pickupDate.trim() !== "" &&
        pickupTime.trim() !== "" &&
        fullName.trim() !== "" &&
        phone.trim() !== "" &&
        address.trim() !== "" &&
        email.trim() !== "" &&
        userId.trim() !== ""
      ) {
        const newBooking: BookingData = {
          userId,
          userEmail: email,
          recycleItem,
          recycleItemPrice: Number(recycleItemPrice),
          pickupDate,
          pickupTime,
          facility: selectedFacility,
          fullName,
          address,
          type,
          phone: Number(phone),
        };

        setIsLoading(true);

        try {
          const response = await fetch(`${SERVER}/api/facility`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newBooking),
          });

          if (response.ok) {
            toast.success("Submitted successfully!", {
              autoClose: 3000,
            });

            // Add credits to the user
            const userIdNumber = parseInt(userId, 10);
            if (!isNaN(userIdNumber)) {
              addCredits(userIdNumber, 100);
            }

            setSelectedBrand("");
            setSelectedModel("");
            setSelectedFacility("");
            setRecycleItemPrice(undefined);
            setPickupDate("");
            setPickupTime("");
            setAddress("");
            setPhone("");
          } else {
            toast.error("Error submitting data.", {
              autoClose: 3000,
            });
          }
        } catch (error) {
          console.error("Error:", error);
          toast.error("Error submitting data.", {
            autoClose: 3000,
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        toast.error("Please fill in all the required fields.", {
          autoClose: 3000,
        });
      }
    } else {
      toast.error("Please login to book a facility", {
        autoClose: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="loader-container">
        <div className="loader" />
        <div className="loading-text">Submitting...</div>
      </div>
    );
  }

  const currentDate = new Date().toISOString().split("T")[0];

  return (
    <div className="container mx-auto p-8">
      <ToastContainer />
      <h1 className="text-4xl font-bold mb-6 p-6 text-center">
        Television Recycling
      </h1>
      <form
        className="grid grid-cols-1 md:grid-cols-2 mx-8 md:mx-0 gap-4 justify-center"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="mb-4">
          <label
            htmlFor="brand"
            className="block text-2xl font-medium text-gray-600"
          >
            Select Brand:
          </label>
          <select
            id="brand"
            value={selectedBrand}
            onChange={handleBrandChange}
            className="w-full p-2 sign-field rounded-md placeholder:font-light placeholder:text-gray-500"
          >
            <option value="">Select Brand</option>
            {brands.map((brand) => (
              <option key={brand.brand} value={brand.brand}>
                {brand.brand}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="model"
            className="block text-2xl font-medium text-gray-600"
          >
            Select Model:
          </label>
          <select
            id="model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full p-2 sign-field rounded-md placeholder:font-light placeholder:text-gray-500"
          >
            <option value="">Select Model</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="recycleItemPrice"
            className="block text-2xl font-medium text-gray-600"
          >
            Recycle Item Price:
          </label>
          <input
            type="number"
            id="recycleItemPrice"
            value={recycleItemPrice ?? ""}
            onChange={(e) => setRecycleItemPrice(Number(e.target.value))}
            className="w-full p-2 sign-field rounded-md placeholder:font-light placeholder:text-gray-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="pickupDate"
            className="block text-2xl font-medium text-gray-600"
          >
            Pickup Date:
          </label>
          <input
            type="date"
            id="pickupDate"
            value={pickupDate}
            min={currentDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className="w-full p-2 sign-field rounded-md placeholder:font-light placeholder:text-gray-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="pickupTime"
            className="block text-2xl font-medium text-gray-600"
          >
            Pickup Time:
          </label>
          <input
            type="time"
            id="pickupTime"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="w-full p-2 sign-field rounded-md placeholder:font-light placeholder:text-gray-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="address"
            className="block text-2xl font-medium text-gray-600"
          >
            Location:
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 sign-field rounded-md placeholder:font-light placeholder:text-gray-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="phone"
            className="block text-2xl font-medium text-gray-600"
          >
            Phone:
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 sign-field rounded-md placeholder:font-light placeholder:text-gray-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="facility"
            className="block text-2xl font-medium text-gray-600"
          >
            Select Facility:
          </label>
          <select
            id="facility"
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="w-full p-2 sign-field rounded-md placeholder:font-light placeholder:text-gray-500"
          >
            <option value="">Select Facility</option>
            {facilities.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 md:col-span-2">
          <button
            type="submit"
            className="bg-emerald-700 text-xl text-white px-6 py-3 rounded-md w-full"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Television;
