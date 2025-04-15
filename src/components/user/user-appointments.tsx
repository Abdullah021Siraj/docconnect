"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader } from "../ui/card";
import { Loader2 } from "lucide-react";
import {
  getAppointmentData,
  getUserAppointmentData,
} from "@/data/appointment-data";
import { useEffect, useState } from "react";
import { useCurrentRole } from "@/hooks/use-current-role";
import { useCurrentUser } from "@/hooks/use-current-user";
import Link from "next/link";

interface Appointment {
  id: string;
  patientName: string;
  startTime: string;
  status: "CONFIRMED" | "CANCELLED" | "PENDING";
  doctor?: {
    name: string;
    speciality: string;
  };
}

export const UserAppointmentsList = () => {
  const [appointmentData, setAppointmentData] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const userRole = useCurrentRole();
  const isUser = userRole === "USER" || userRole === "ADMIN";
  const user = useCurrentUser();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserAppointmentData();
        setAppointmentData(data);
      } catch (err) {
        setError("Unable to fetch appointment data.");
        console.error("Unable to fetch appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isUser && user?.id) {
      fetchAppointments();
    }
  }, [isUser, user?.id]);

  if (!isUser) return null;

  return (
    <div className="group mt-6 p-4 relative col-span-1 block w-full h-full focus:outline-none focus:ring-2 rounded-2xl ">
      <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-orange-200 bg-clip-text text-transparent">
        Upcoming Appointments
      </h1>
      <div className="absolute -inset-1 rounded-2xl opacity-20 blur transition-all group-hover:opacity-30 group-hover:-inset-0.5"></div>

      <Card className="relative p-6 bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xs hover:shadow-sm transition-all h-full">
        <CardHeader className="text-xl font-semibold">
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : appointmentData.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No upcoming appointments found
          </div>
        ) : (
          <Table className="border-2 border-black">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Doctor</TableHead>
                <TableHead className="text-right">Speciality</TableHead>
                <TableHead className="text-right">Room Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointmentData.map((appointment, index) => (
                <TableRow key={appointment.id || `appointment-${index}`}>
                  <TableCell className="font-medium">
                    {appointment.patientName || "Unknown"}
                  </TableCell>
                  <TableCell>
                    {appointment.startTime
                      ? new Date(appointment.startTime).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>{appointment.status || "CONFIRMED"}</TableCell>
                  <TableCell>
                    <div className="font-semibold">
                      {appointment.startTime
                        ? new Date(appointment.startTime).toLocaleTimeString()
                        : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {appointment.doctor?.name || "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    {appointment.doctor?.speciality || "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    {appointment.roomId ? (
                      <Link
                        href={`/room/${appointment.roomId}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Join Room
                      </Link>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};
