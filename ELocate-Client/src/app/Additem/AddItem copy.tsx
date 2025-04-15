"use client";
import React, { useState, useMemo } from 'react';
import { SERVER } from '../utils/SERVER'; 

const categories = [
  "Battery", "Keyboard", "Microwave", "Mobile", "Mouse",
  "PCB", "Player", "Printer", "Television", "Washing Machine", "Other"
];

const AddItem = () => {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<FileList | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);

  const imagePreviews = useMemo(() => {
    if (!images) return [];
    const urls = [];
    for (let i = 0; i < images.length && i < 3; i++) {
      urls.push(URL.createObjectURL(images[i]));
    }
    return urls;
  }, [images]);

  const allFieldsFilled = category && title && description && price && email && contact && location;
  const canSubmit = allFieldsFilled && images && images.length > 0 && images.length <= 3 && !loading;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setImages(files);
    setUploadSuccess(null);
    setError("");
  };

  const resetForm = () => {
    setCategory("");
    setTitle("");
    setDescription("");
    setPrice("");
    setEmail("");
    setContact("");
    setLocation("");
    setImages(null);
    setUploadSuccess(true);
    setError("");
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      setError("Please fill all fields and select up to 3 images.");
      return;
    }

    setLoading(true);
    setError("");
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append("category", category);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("email", email);
    formData.append("contact", contact);
    formData.append("location", location);

    if (images) {
      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      }
    }

    try {
      const res = await fetch(`${SERVER}/api/additem`, {
        method: "POST",
        body: formData
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to add product");
        setUploadSuccess(false);
      } else {
        resetForm();
      }
    } catch (err: any) {
      setError("An error occurred: " + err.message);
      setUploadSuccess(false);
    }

    setLoading(false);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="max-w-3xl w-full bg-white p-8 rounded-lg shadow">
        {/* Top Message */}
        <p className="text-lg text-gray-600 mb-4">
          Once you have added your product, you can immediately find it on the catalog!
        </p>

        {/* Form Title */}
        <h2 className="text-3xl font-bold mb-6 text-center">
          List Your E-Waste for Sale
        </h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {uploadSuccess === true && (
          <p className="text-green-600 mb-4">
            Product added successfully! You can add another one below.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Title"
            className="border p-2 rounded"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Description"
            className="border p-2 rounded"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <input
            type="number"
            placeholder="Price (INR)"
            className="border p-2 rounded"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email of Seller"
            className="border p-2 rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="Contact Number of Seller"
            className="border p-2 rounded"
            value={contact}
            onChange={e => setContact(e.target.value)}
          />

          <input
            type="text"
            placeholder="Location of Seller"
            className="border p-2 rounded"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />

          <label className="border p-2 cursor-pointer bg-gray-200 hover:bg-gray-300 rounded inline-block text-center">
            {uploadSuccess === true ? "Choose Images (up to 3)" : "Choose Images (up to 3)"}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {imagePreviews.map((url, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={url}
                    alt={`Selected Image ${idx + 1}`}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`mt-4 py-2 px-4 rounded text-white ${
              canSubmit ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AddItem;

