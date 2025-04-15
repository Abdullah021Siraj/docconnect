"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader } from "../ui/card";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ArrowRight, Loader2, Table } from "lucide-react";
import { useCurrentRole } from "@/hooks/use-current-role";
import { useEffect, useState } from "react";
import { getUserAppointmentData } from "@/data/appointment-data";

interface Appointment {
  id: string;
  patientName: string;
  startTime: string;
  // status: string;
  status: "SCHEDULED" | "CANCELLED" | "PENDING";
  doctor?: {
    name: string;
    speciality: string;
  };
}

const UserDashboard = () => {
  const user = useCurrentUser();
  return (
    <div className="p-4 md:p-6  min-h-screen ">
      {/* Modern Glassmorphism Header */}
      <div className="text-left mb-8 md:mb-12 space-y-4 max-w-8xl">
        <div className="backdrop-blur-lg bg-white/20 p-6 rounded-2xl shadow-sm border border-white/20">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-orange-200 bg-clip-text text-transparent">
            Welcome Back, <br />
            <span className="text-3xl text-black">{user?.name}</span>
          </h1>
          <p className="text-lg md:text-xl text-black mt-3 leading-relaxed">
            Personalized healthcare at your fingertips - seamless, modern, and
            secure.
          </p>
        </div>
      </div>

      {/* Modern Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8 max-w-8xl">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Card 1 - Appointment */}
          <Link
            href="/appointment"
            className="group relative col-span-1 block w-full h-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-2xl transition-transform hover:-translate-y-0.5"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-20 blur transition-all group-hover:opacity-30 group-hover:-inset-0.5"></div>
            <Card className="relative p-6 bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xs hover:shadow-sm transition-all h-full">
              <CardHeader className="text-xl font-semibold flex items-center gap-3">
                <span className="p-3 bg-indigo-100/50 backdrop-blur-sm rounded-xl">
                  📅
                </span>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Book Appointments
                </span>
              </CardHeader>
              <CardDescription className="mt-2 text-gray-600 pl-2">
                Schedule your next visit with expert doctors near you.
              </CardDescription>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 group-hover/link:text-indigo-800 transition-colors">
                <span className="bg-indigo-600/10 px-3 py-1.5 rounded-full">
                  Book Now
                  <ArrowRight className="h-4 w-4 inline-block ml-2 transition-transform group-hover/link:translate-x-1" />
                </span>
              </div>
            </Card>
          </Link>

          {/* Card 2 - Lab Tests */}
          <Link
            href="/lab"
            className="group relative col-span-1 block w-full h-full focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 rounded-2xl transition-transform hover:-translate-y-0.5"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-orange-600 rounded-2xl opacity-20 blur transition-all group-hover:opacity-30 group-hover:-inset-0.5"></div>
            <Card className="relative p-6 bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xs hover:shadow-sm transition-all h-full">
              <CardHeader className="text-xl font-semibold flex items-center gap-3">
                <span className="p-3 bg-rose-100/50 backdrop-blur-sm rounded-xl">
                  🧪
                </span>
                <span className="bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
                  Lab Tests
                </span>
              </CardHeader>
              <CardDescription className="mt-2 text-gray-600 pl-2">
                Accurate results from certified labs with instant reports.
              </CardDescription>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-rose-600 group-hover/link:text-rose-800 transition-colors">
                <span className="bg-rose-600/10 px-3 py-1.5 rounded-full">
                  View Tests
                  <ArrowRight className="h-4 w-4 inline-block ml-2 transition-transform group-hover/link:translate-x-1" />
                </span>
              </div>
            </Card>
          </Link>

          {/* Card 3 - Online Consult */}
          <Link
            href="/meeting"
            className="group relative col-span-1 block w-full h-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 rounded-2xl transition-transform hover:-translate-y-0.5"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl opacity-20 blur transition-all group-hover:opacity-30 group-hover:-inset-0.5"></div>
            <Card className="relative p-6 bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xs hover:shadow-sm transition-all h-full">
              <CardHeader className="text-xl font-semibold flex items-center gap-3">
                <span className="p-3 bg-cyan-100/50 backdrop-blur-sm rounded-xl">
                  💻
                </span>
                <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Virtual Consult
                </span>
              </CardHeader>
              <CardDescription className="mt-2 text-gray-600 pl-2">
                Secure video consultations with top specialists nationwide.
              </CardDescription>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-cyan-600 group-hover/link:text-cyan-800 transition-colors">
                <span className="bg-cyan-600/10 px-3 py-1.5 rounded-full">
                  Start Session
                  <ArrowRight className="h-4 w-4 inline-block ml-2 transition-transform group-hover/link:translate-x-1" />
                </span>
              </div>
            </Card>
          </Link>
        </div>
        
      </div>
      
    </div>
  );
};

export default UserDashboard;
