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

interface Appointment {
  id: string;
  patientName: string;
  startTime: string;
  status: string;
  doctor?: {
    name: string;
    speciality: string;
  };
}

export function DashboardTable() {
  const [appointmentData, setAppointmentData] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getAppointmentData();
        setAppointmentData(data);
      } catch (error) {
        setError("Unable to fetch appointment data.");
        console.error("Unable to fetch appointments:", error);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div className="ml-4 mr-4 overflow-hidden rounded-xl border-black border-2 p-4">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
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
            {appointmentData?.map((appointment) => (
              <TableRow key={appointment.id}>
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
      )}
    </div>
  );
}
