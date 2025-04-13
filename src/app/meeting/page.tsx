"use client";

import useUser from "@/src/hooks/useUser";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

export default function Home() {
  const { fullName, setFullName } = useUser();
  const [roomID, setRoomID] = useState("");
  const router = useRouter();

  useEffect(() => {
    setFullName("");
  }, []);
  return (
    <div className="w-full">
      <section className="text-gray-800">
        <div className="mx-auto max-w-screen-xl px-4 py-16 h-full flex items-center justify-center"> 
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl">
            {/* Left Column - Portal */}
            <div className="bg-white rounded-xl shadow-md p-8 border-2 border-black">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Virtual Consultation Portal</h1>
                  <p className="text-sm text-gray-500">Secure video meeting platform</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    onChange={(e) => setFullName(e.target.value.toString())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Dr. John Smith or Patient Name"
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimum 3 characters required</p>
                </div>

                {fullName && fullName.length >= 3 && (
                  <>
                    <div className="pt-4 border-t border-gray-100">
                      <label htmlFor="roomid" className="block text-sm font-medium text-gray-700 mb-1">Meeting Access</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="roomid"
                          value={roomID}
                          onChange={(e) => setRoomID(e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          placeholder="Enter meeting code or paste link"
                        />
                        <button
                          className="rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => router.push(`/room/${roomID}`)}
                          disabled={!roomID}
                        >
                          Join
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Your doctor should have provided you with a meeting code
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-3">or</p>
                      <button
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center justify-center gap-2 w-full"
                        onClick={() => router.push(`/room/${uuid()}`)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create New Consultation
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column - Guidelines */}
            <div className="bg-white rounded-xl shadow-md p-8 border border-blue-100 mr-10 border-2 border-black">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Consultation Guidelines</h2>
                  <p className="text-sm text-gray-500">For best experience during your virtual visit</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Privacy First</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      This is a secure, HIPAA-compliant platform. Ensure you're in a private space where others cannot overhear your consultation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Technical Setup</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Test your microphone and camera before joining. Use Chrome or Firefox for best performance. Ensure good lighting facing you (not behind you).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Prepare Information</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Have your health information ready: current medications, symptoms, medical history, and any questions you want to discuss.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Timing</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Join 5 minutes before your scheduled time. If you're more than 10 minutes late, your appointment may need to be rescheduled.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
)
}
