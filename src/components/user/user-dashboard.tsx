"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader } from "../ui/card";
import { UserInfo } from "../user-info";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

const UserDashboard = () => {
    const user = useCurrentUser();

    return (
        <div className="p-4 md:p-6 bg-white min-h-screen">
  {/* Enhanced Header */}
  <div className="text-center mb-8 md:mb-12 space-y-3">
    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
      Your Health, Our Priority
      <span className="ml-3 inline-block animate-pulse">🌟</span>
    </h1>
    <p className="text-lg md:text-xl text-gray-700 mt-2 max-w-2xl mx-auto leading-relaxed">
      Trusted care, tailored for you—book appointments, lab tests, and more.
    </p>
  </div>

  {/* Enhanced Bento Grid */}
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
    {/* Left Section */}
    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Card 1 - Appointment */}
      <Card className="group relative p-6 shadow-lg border border-gray-200/50 bg-gradient-to-tr from-gray-900 to-black text-white rounded-2xl transition-all hover:shadow-xl hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent rounded-2xl" />
        <CardHeader className="text-xl font-semibold flex items-center gap-3">
          <span className="p-2 bg-white/10 rounded-lg">📅</span>
          Book Appointments
        </CardHeader>
        <CardDescription className="mt-2 text-gray-300">
          Schedule your next visit with expert doctors near you.
        </CardDescription>
        <Link
          href="/appointment"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
        >
          Book Now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>

      {/* Card 2 - Lab Tests */}
      <Card className="group p-6 shadow-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 rounded-2xl transition-all hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="text-xl font-semibold text-gray-900 flex items-center gap-3">
          <span className="p-2 bg-red-50 rounded-lg">🧪</span>
          Lab Tests
        </CardHeader>
        <CardDescription className="mt-2 text-gray-600">
          Accurate results from certified labs with affordable pricing.
        </CardDescription>
        <Link
          href="/lab"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
        >
          Learn More
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>

      {/* Card 3 - Online Consult */}
      <Card className="group p-6 shadow-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white rounded-2xl transition-all hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="text-xl font-semibold text-gray-900 flex items-center gap-3">
          <span className="p-2 bg-blue-100 rounded-lg">💻</span>
          Consult Online
        </CardHeader>
        <CardDescription className="mt-2 text-gray-600">
          Speak to trusted specialists via secure video consultations.
        </CardDescription>
        <Link
          href="/consult"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Start Consultation
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>

      {/* Card 4 - Medicines */}
      <Card className="group p-6 shadow-lg border border-gray-200 bg-gradient-to-br from-green-50 to-white rounded-2xl transition-all hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="text-xl font-semibold text-gray-900 flex items-center gap-3">
          <span className="p-2 bg-green-100 rounded-lg">💊</span>
          Order Medicines
        </CardHeader>
        <CardDescription className="mt-2 text-gray-600">
          Get your prescriptions delivered right to your doorstep.
        </CardDescription>
        <Link
          href="/pharmacy"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          Shop Now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    </div>

    {/* Enhanced Right Section */}
    
  </div>
</div>
    );
};

export default UserDashboard;