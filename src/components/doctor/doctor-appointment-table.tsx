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
import { useCurrentRole } from "@/hooks/use-current-role";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader } from "../ui/card";
import { getDoctorAppointmentData } from "@/data/appointment-data";


interface Appointment {
  id: string;
  patientName: string;
  startTime: string;
  doctor?: {
    name: string;
  };
}

export function DoctorAppointmentTable() {
  const [appointmentData, setAppointmentData] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const userRole = useCurrentRole();
  const user = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const isDoctor = userRole === "DOCTOR" || userRole === "ADMIN";

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user?.id) {
          setError("User not authenticated");
          return;
        }
  
        // If doctors have separate IDs, you might need:
        // const doctorId = await getDoctorIdByUserId(user.id);
        const data = await getDoctorAppointmentData(user.id);
        
        console.log("Fetched appointments:", data);
        setAppointmentData(data);
      } catch (err) {
        setError("Failed to load appointments");
        console.error("Appointment fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
  
    if (isDoctor) {
      fetchAppointments();
    }
  }, [user?.id, isDoctor]);  // Add dependencies

  if (!isDoctor) {
    return (
      <Alert className="mx-4 my-2">
        <AlertTitle>Access Restricted</AlertTitle>
        <AlertDescription>
          You need doctor privileges to view appointments.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="ml-4 mr-4 overflow-hidden rounded-xl w-[1600px] p-4">
      {error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : (
        <div className="border-2 rounded-xl p-4">
          <Card className="mb-6">
            <CardHeader className="text-xl font-bold">
              Your Appointments
            </CardHeader>
          </Card>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Doctor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointmentData.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.patientName}</TableCell>
                  <TableCell>
                    {new Date(appointment.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {appointment.doctor?.name || "You"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {appointmentData.length === 0 && !error && (
            <div className="text-center p-4 text-gray-500">
              No upcoming appointments
            </div>
          )}
        </div>
      )}
    </div>
  );
}