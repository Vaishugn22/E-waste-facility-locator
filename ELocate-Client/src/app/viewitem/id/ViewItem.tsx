"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SERVER } from '../utils/SERVER'; 

const ViewItem = () => {
  const params = useParams();
  const productId = params?.id;

  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) {
      setError("Invalid product ID.");
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${SERVER}/api/products/${productId}`);
        if (!res.ok) {
          throw new Error("Product not found");
        }
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        console.error("Error fetching product:", err.message);
        setError(err.message || "Something went wrong.");
      }
    };

    fetchProduct();
  }, [productId]);

  if (error) {
    return (
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow mt-28">
        <p className="text-red-600">{error}</p>
        <Link href="/catalog">
          <button className="mt-4 bg-emerald-600 text-white py-2 px-4 rounded hover:bg-emerald-700">
            Go Back
          </button>
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow mt-28">
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow mt-28">
      <Link href="/Catalog">
        <button className="mb-4 bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400">
          Back to Catalog
        </button>
      </Link>
      <div className="flex flex-col gap-8">
        {/* Image Display */}
        <div className="flex gap-4 justify-center">
          {product.images.map((img: string | null, index: number) =>
            img ? (
              <img
                key={index}
                src={img}
                alt={`Product Image ${index + 1}`}
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            ) : null
          )}
        </div>
        {/* Product Details */}
        <div className="w-full">
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <p className="text-gray-700 mb-2 text-lg">Category: {product.category}</p>
          <p className="text-green-700 font-bold mb-4 text-2xl">Price: ₹{product.price}</p>
          <p className="mb-4 text-lg">{product.description}</p>

          {/* Single-column layout for details */}
          <div className="grid grid-cols-1 gap-4">
            <p className="text-lg">
              <strong>Email:</strong> {product.email}
            </p>
            <p className="text-lg">
              <strong>Contact:</strong> {product.contact}
            </p>
            <p className="text-lg">
              <strong>Location:</strong> {product.location}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewItem;
