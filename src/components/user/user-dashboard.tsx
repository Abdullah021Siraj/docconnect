"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader } from "../ui/card";
import { UserInfo } from "../user-info";
import { useCurrentUser } from "@/hooks/use-current-user";

const UserDashboard = () => {
    const user = useCurrentUser();

    return (
        <div className="p-4 md:p-6 bg-white min-h-screen">
            {/* Header */}
            <div className="text-center mb-8 md:mb-12">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black">
                    Your Health, Our Priority 🌟
                </h1>
                <p className="text-base md:text-lg text-gray-600 mt-2 px-3 md:px-0">
                    Trusted care, tailored for you—book appointments, lab tests, and more.
                </p>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
                {/* Left Section */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Card 1 */}
                    <Card className="p-4 md:p-6 shadow-md border border-gray-200 bg-gradient-to-tr from-black to-gray-900 text-white rounded-lg hover:shadow-xl hover:scale-105 transition-transform duration-300">
                        <CardHeader className="text-lg md:text-xl font-semibold">Book Appointments 📅</CardHeader>
                        <CardDescription className="mt-2 text-sm md:text-base">
                            Schedule your next visit with expert doctors near you.
                        </CardDescription>
                        <Link
                            href="/appointment"
                            className="mt-4 inline-block text-sm md:text-base text-white underline"
                        >
                            Book Now →
                        </Link>
                    </Card>

                    {/* Card 2 */}
                    <Card className="p-4 md:p-6 shadow-md border border-gray-200 bg-gradient-to-br from-gray-100 to-white rounded-lg hover:shadow-xl hover:scale-105 transition-transform duration-300">
                        <CardHeader className="text-lg md:text-xl font-semibold text-black">Lab Tests 🧪</CardHeader>
                        <CardDescription className="mt-2 text-sm md:text-base text-gray-600">
                            Accurate results from certified labs with affordable pricing.
                        </CardDescription>
                        <Link
                            href="/lab"
                            className="mt-4 inline-block text-sm md:text-base text-gray-800 underline"
                        >
                            Learn More →
                        </Link>
                    </Card>

                    {/* Card 3 */}
                    <Card className="p-4 md:p-6 shadow-md border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-200 rounded-lg hover:shadow-xl hover:scale-105 transition-transform duration-300">
                        <CardHeader className="text-lg md:text-xl font-semibold text-gray-800">Consult Online 💻</CardHeader>
                        <CardDescription className="mt-2 text-sm md:text-base text-gray-700">
                            Speak to trusted specialists via secure video consultations.
                        </CardDescription>
                        <Link
                            href="/consult"
                            className="mt-4 inline-block text-sm md:text-base text-gray-800 underline"
                        >
                            Start Consultation →
                        </Link>
                    </Card>

                    {/* Card 4 */}
                    <Card className="p-4 md:p-6 shadow-md border border-gray-200 bg-gradient-to-tr from-gray-50 to-white rounded-lg hover:shadow-xl hover:scale-105 transition-transform duration-300">
                        <CardHeader className="text-lg md:text-xl font-semibold text-gray-800">Order Medicines 💊</CardHeader>
                        <CardDescription className="mt-2 text-sm md:text-base text-gray-700">
                            Get your prescriptions delivered right to your doorstep.
                        </CardDescription>
                        <Link
                            href="/pharmacy"
                            className="mt-4 inline-block text-sm md:text-base text-gray-800 underline"
                        >
                            Shop Now →
                        </Link>
                    </Card>
                </div>

                {/* Right Section */}
                <div className="lg:col-span-1">
                    <Card className="p-4 md:p-6 shadow-md border border-gray-200 bg-gradient-to-br from-white to-gray-50 rounded-lg hover:shadow-xl hover:scale-105 transition-transform duration-300">
                        <UserInfo label="User Information" user={user} />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;