'use client';

import { useState, ChangeEvent, FormEvent, useRef, useEffect } from "react";

interface MedicineInfo {
  'Medicine Name': string;
  'Salt Composition': string;
  'Uses': string;
  'Side_effects': string;
  'Manufacturer': string;
  'Image URL': string;
  'Excellent': string;
  'Average': string;
  'Poor': string;
}

export function Prescription() {
  const [image, setImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [rawOutput, setRawOutput] = useState<string | null>(null);
  const [medicineInfo, setMedicineInfo] = useState<MedicineInfo[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showRawOutput, setShowRawOutput] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.match('image.*')) {
        setError("Please upload an image file (JPEG, PNG)");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB");
        return;
      }

      setImage(file);
      setError(null);
      setResult(null);
      setRawOutput(null);
      setMedicineInfo(null);

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      if (!file.type.match('image.*')) {
        setError("Please upload an image file (JPEG, PNG)");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB");
        return;
      }
      
      setImage(file);
      setError(null);
      setResult(null);
      setRawOutput(null);
      setMedicineInfo(null);

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePromptChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setRawOutput(null);
    setMedicineInfo(null);

    if (!image) {
      setError("Please select an image first");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", image);
      if (prompt) {
        formData.append("prompt", prompt);
      }

      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to process prescription");
      }

      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      setRawOutput(data.raw_output || "No raw text extracted.");
      setResult(data.cleaned_output || "No text could be extracted from the image.");
      setMedicineInfo(data.medicine_info || null);

      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth' });
      }

    } catch (err) {
      console.error("Processing error:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearResults = () => {
    setResult(null);
    setRawOutput(null);
    setMedicineInfo(null);
    setImage(null);
    setPreviewUrl(null);
    setPrompt("");
    setShowRawOutput(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleRawOutput = () => {
    setShowRawOutput(!showRawOutput);
  };

  const formatOutput = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));
  };

  const MedicineCard = ({ medicine }: { medicine: MedicineInfo }) => {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 border border-gray-200">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{medicine['Medicine Name']}</h3>
              <p className="text-sm text-gray-600">{medicine['Manufacturer']}</p>
            </div>
            {medicine['Image URL'] && (
              <img 
                src={medicine['Image URL']} 
                alt={medicine['Medicine Name']}
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
          
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-900">Composition:</h4>
            <p className="text-sm text-gray-600">{medicine['Salt Composition']}</p>
          </div>
          
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-900">Uses:</h4>
            <p className="text-sm text-gray-600">{medicine['Uses']}</p>
          </div>
          
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-900">Side Effects:</h4>
            <p className="text-sm text-gray-600">{medicine['Side_effects']}</p>
          </div>
          
          <div className="mt-3 flex justify-between text-xs">
            <span className="text-green-600">Excellent: {medicine['Excellent']}%</span>
            <span className="text-yellow-600">Average: {medicine['Average']}%</span>
            <span className="text-red-600">Poor: {medicine['Poor']}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-700">
              Prescription Analyser
            </span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-600">
            Upload a prescription image to extract medicines and get detailed information
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Column - Input Form */}
            <div className="p-8 sm:p-10 bg-gradient-to-br from-orange-50 to-orange-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Prescription Image <span className="text-red-500">*</span>
                  </label>
                  <div 
                    className={`flex items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${previewUrl ? 'border-orange-300 bg-orange-25' : 'border-gray-300 hover:border-orange-400 bg-white'}`}
                    onClick={triggerFileInput}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {previewUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img 
                          src={previewUrl} 
                          alt="Prescription preview"
                          className="max-h-full max-w-full object-contain rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                          <span className="text-white bg-orange-600 px-3 py-1 rounded-full text-sm font-medium opacity-0 hover:opacity-100 transition-opacity">
                            Change Image
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-5">
                        <div className="w-12 h-12 mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="mb-1 text-sm font-medium text-gray-700">
                          <span className="text-orange-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG (MAX. 10MB)</p>
                      </div>
                    )}
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Prompt Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Custom Instructions (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={prompt}
                      onChange={handlePromptChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                      placeholder="E.g. 'Extract medication names and dosages only'"
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Tips for better results */}
                <div className="rounded-lg bg-orange-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-orange-800">Tips for better results</h3>
                      <div className="mt-2 text-sm text-orange-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Ensure good lighting when taking the photo</li>
                          <li>Keep the prescription flat to avoid shadows</li>
                          <li>Make sure text is clear and in focus</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !image}
                  className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-150 ${isLoading || !image ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-1 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Analyze Prescription
                    </>
                  )}
                </button>

                {/* Error Message */}
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Right Column - Result */}
            <div className="p-8 sm:p-10 bg-white" ref={resultRef}>
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Extracted Results
                  </h2>
                  <div className="flex space-x-2">
                    {result && (
                      <>
                        <button 
                          onClick={toggleRawOutput}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                          {showRawOutput ? "Show Processed" : "Show Raw Text"}
                        </button>
                        <button 
                          onClick={() => navigator.clipboard.writeText(showRawOutput ? (rawOutput || "") : (result || ""))}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                          <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          Copy
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex-1 bg-gray-50 rounded-xl p-6 overflow-auto">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <svg className="animate-spin mx-auto h-12 w-12 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-3 text-lg font-medium text-gray-900">Analyzing your prescription...</p>
                        <p className="mt-1 text-gray-500">This may take a few seconds</p>
                      </div>
                    </div>
                  ) : result ? (
                    <div className="space-y-6">
                      <div className="prose prose-orange max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                          {showRawOutput ? formatOutput(rawOutput || "") : formatOutput(result)}
                        </pre>
                      </div>
                      
                      {medicineInfo && !showRawOutput && (
                        <div className="mt-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-3">Medicine Information</h3>
                          {medicineInfo.length > 0 ? (
                            <div className="space-y-4">
                              {medicineInfo.map((info, index) => (
                                <MedicineCard key={index} medicine={info} />
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No additional medicine information found in our database</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                      <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293 GRU3 5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No results yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Upload a prescription image and click "Analyze Prescription" to see the extracted text here.
                      </p>
                    </div>
                  )}
                </div>

                {result && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearResults}
                      className="text-sm font-medium text-orange-600 hover:text-orange-500 focus:outline-none"
                    >
                      Clear results & try another image
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by AI technology • Securely processed • 100% confidential</p>
        </div>
      </div>
    </div>
  );
}