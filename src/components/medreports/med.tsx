"use client";
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface Doctor {
  name: string;
  specialty: string;
  email: string;
  qualification?: string;
  hospital?: string;
  location?: string;
  availability?: string;
  languages?: string[];
  rating?: number;
}

interface Prediction {
  label: string;
  confidence: number;
  explanation?: string;
}

export default function MedicalReportAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<{
    extractedText: string;
    predictions: Prediction[];
    doctors: Doctor[];
    guidance: string[];
    primaryCondition?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setResults(null);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const analyzeReport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const data = await response.json();
      setResults({
        extractedText: data.extracted_text,
        predictions: data.predictions,
        doctors: data.doctors.map((doctor: any) => ({
          name: doctor.name,
          specialty: doctor.specialty,
          email: doctor.contact, // Map backend 'contact' to 'email'
          qualification: doctor.qualification,
          hospital: doctor.hospital,
          location: doctor.location,
          availability: doctor.availability,
          languages: doctor.languages,
          rating: doctor.rating
        })),
        guidance: typeof data.guidance === 'string' 
          ? [data.guidance] 
          : data.guidance,
        primaryCondition: data.primary_condition
      });
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to analyze report');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Medical Report Intelligence
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Upload your medical report for AI-powered analysis and specialist recommendations
        </p>
        
        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-gray-600">
                {isDragActive ? (
                  <span className="text-blue-600">Drop your medical report here</span>
                ) : (
                  <>
                    <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500">
                Supports JPG, PNG (max 10MB)
              </p>
              {file && (
                <div className="mt-2 px-3 py-2 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium text-blue-700 truncate max-w-xs">
                    {file.name}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={analyzeReport}
              disabled={loading || !file}
              className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 ${
                loading || !file
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Analyze Report
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-100">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
        
        {/* Results Section */}
        {results && (
          <div className="space-y-8">
            {/* Extracted Text */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Extracted Report Content</h2>
              </div>
              <div className="p-6">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {results.extractedText || "No text could be extracted"}
                </pre>
              </div>
            </div>
            
            {/* AI Predictions */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">AI Analysis Results</h2>
              </div>
              <div className="p-6">
                {results.predictions.length > 0 ? (
                  <div className="space-y-4">
                    {results.predictions.map((prediction, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{prediction.label}</h3>
                            {prediction.explanation && (
                              <p className="text-sm text-gray-600 mt-1">{prediction.explanation}</p>
                            )}
                          </div>
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {Math.round(prediction.confidence * 100)}% confidence
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No specific conditions detected</p>
                )}
              </div>
            </div>
            
            {/* Doctor Recommendations */}
            {results.primaryCondition && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Recommended {results.doctors.length > 0 ? results.doctors[0].specialty : ''} Specialists
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    For {results.primaryCondition}
                  </p>
                </div>
                <div className="p-6">
                  {results.doctors.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {results.doctors.map((doctor, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <h3 className="text-lg font-medium">{doctor.name}</h3>
                              <p className="text-blue-600">{doctor.specialty}</p>
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="flex-shrink-0 mr-2 h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" clipRule="evenodd" />
                                  </svg>
                                  {doctor.email}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No specialists found for this condition</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Patient Guidance */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">
                  Patient Guidance {results.primaryCondition ? `for ${results.primaryCondition}` : ''}
                </h2>
              </div>
              <div className="p-6">
                {results.guidance.length > 0 ? (
                  <div className="space-y-4">
                    {results.guidance.map((item, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-gray-800">{item}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No specific guidance available</p>
                )}
                
                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        This information is not medical advice. Always consult with a qualified healthcare professional for diagnosis and treatment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}