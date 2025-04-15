"use client";
import React, { useState } from 'react';
import { SERVER } from '../utils/SERVER'; 

const EAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Analysis results
  const [wasteType, setWasteType] = useState<string>("");
  const [recommendedCenter, setRecommendedCenter] = useState<string>("");
  const [usable, setUsable] = useState<boolean | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Reset states when a new file is chosen
      setUploadSuccess(null);
      setErrorMessage("");
      setWasteType("");
      setRecommendedCenter("");
      setUsable(null);

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      // If no file is selected, reset states
      setSelectedFile(null);
      setPreviewUrl("");
      setUploadSuccess(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setErrorMessage("Please select a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploading(true);
    setUploadSuccess(null);
    setErrorMessage("");
    setWasteType("");
    setRecommendedCenter("");
    setUsable(null);

    try {
      const response = await fetch(`${SERVER}/api/image`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setWasteType(data.wasteType || "Unknown");
        setRecommendedCenter(data.recommendedCenter || "No center found");
        setUsable(typeof data.usable === 'boolean' ? data.usable : null);

        setUploadSuccess(true);
      } else {
        const errorData = await response.text();
        setUploadSuccess(false);
        setErrorMessage(`Upload failed with status ${response.status}: ${errorData}`);
      }
    } catch (error: any) {
      setUploadSuccess(false);
      setErrorMessage(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="section eanalyzer min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="max-w-5xl w-full bg-white p-8 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Left Column: Information */}
          <div className="md:w-1/2">
            <p className="section-subtitle font-bold text-gray-700 mb-2">
              -E-Analyzer-
            </p>
            <h2 className="text-4xl section-title font-bold text-black mb-4">
              Efficiently Analyze Your E-Waste
            </h2>
            <p className="section-text text-2xl text-gray-600 font-medium leading-relaxed mb-8">
              Our E-Analyzer helps you identify the type of your electronic waste 
              and suggests suitable recycling facilities. Upload an image of your 
              e-waste to get started.
            </p>
          </div>

          {/* Right Column: File Upload, Preview, Analyze and Results */}
          <div className="md:w-1/2 flex flex-col items-center">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
              {/* File Upload Button */}
              <label className="border p-2 cursor-pointer bg-gray-200 hover:bg-gray-300 rounded inline-block text-center">
                {uploadSuccess === true ? "Upload another image" : "Choose File"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {previewUrl && (
                <div className="relative w-full h-auto mt-4">
                  <img
                    src={previewUrl}
                    alt="Selected Waste"
                    className="w-full h-auto object-cover rounded-lg"
                  />
                  {uploading && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                      <div className="text-white text-xl font-bold animate-pulse">
                        Analyzing...
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Show Analyze button only if a file is selected, not uploading, and no successful result yet */}
              {selectedFile && !uploading && uploadSuccess !== true && (
                <button
                  type="submit"
                  className="bg-emerald-600 text-white py-2 px-4 rounded hover:bg-emerald-700 mt-4"
                >
                  Analyze
                </button>
              )}
            </form>

            {/* Display results below the image */}
            {uploadSuccess === true && (
              <div className="mt-8 w-full text-left">
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  Analysis Results
                </h3>
                <p className="text-gray-700 mb-1">
                  <strong>Waste Type:</strong> {wasteType}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Recommended Center:</strong> {recommendedCenter}
                </p>
                <p className="text-gray-700">
                  <strong>Usable:</strong> {usable === null ? "N/A" : (usable ? "Yes" : "No")}
                </p>
              </div>
            )}

            {uploadSuccess === false && (
              <p className="text-red-600 mt-4">Error: {errorMessage}</p>
            )}

            {errorMessage && uploadSuccess !== false && (
              <p className="text-red-600 mt-4">{errorMessage}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EAnalyzer;
