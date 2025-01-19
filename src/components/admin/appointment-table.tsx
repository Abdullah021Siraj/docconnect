"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { getAppointmentData } from "@/data/appointment-data";
import { useCurrentRole } from "@/hooks/use-current-role";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";

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

export function AppointmentTable() {
  const [appointmentData, setAppointmentData] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const userRole = useCurrentRole();
  const isAdmin = userRole === "ADMIN";

  // Fetch appointment data
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getAppointmentData();
        console.log("Fetched Appointment Data:", data);
        setAppointmentData(data);
      } catch (err) {
        setError("Unable to fetch appointment data.");
        console.error("Unable to fetch appointments:", err);
      }
    };

    if (isAdmin) {
      fetchAppointments();
    }
  }, []);

  if (!isAdmin) {
    return (
      <Alert className="mx-4 my-2">
        <AlertTitle>Access Restricted</AlertTitle>
        <AlertDescription>
          You need administrator privileges to view appointment data.
        </AlertDescription>
      </Alert>
    );
  }

  const scheduledAppointments = appointmentData.filter(
    (apt) => apt.status?.toUpperCase() === "CONFIRMED"
  );
  const cancelledAppointments = appointmentData.filter(
    (apt) => apt.status?.toUpperCase() === "CANCELLED"
  );
  const pendingAppointments = appointmentData.filter(
    (apt) => apt.status?.toUpperCase() === "PENDING"
  );

  return (
    <div className="ml-4 mr-4 overflow-hidden rounded-xl w-[1600px] p-4">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div>
          <Button
            variant="destructive"
            className="mb-4 ml-4 border-white border-2"
          >
            <Link href="/dashboard/lab">Lab Dashboard</Link>
          </Button>

          <div className="ml-4 mr-4 overflow-hidden rounded-xl border-black border-2 p-4 border-white border-2">
            <Card className="mb-6 ">
              <CardHeader className="text-xl font-bold">
                Appointments Summary
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800">
                      Scheduled Appointments
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {scheduledAppointments.length}
                    </p>
                  </div>
                  <div className="bg-red-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800">
                      Cancelled Appointments
                    </h3>
                    <p className="text-2xl font-bold text-red-600">
                      {cancelledAppointments.length}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800">
                      Pending Appointments
                    </h3>
                    <p className="text-2xl font-bold text-yellow-600">
                      {pendingAppointments.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Doctor</TableHead>
                  <TableHead className="text-right">Speciality</TableHead>
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
                    <TableCell>{appointment.status || "Pending"}</TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
