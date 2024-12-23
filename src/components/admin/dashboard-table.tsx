"use client";

import { getAppointmentData } from "@/data/appointment-data";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

export async function DashboardTable() {
  // const [appointmentData, setAppointmentData] = useState([]);

  // useEffect(() => {
  //   const fetchAppointments = async () => {
  //     try {
  //       const data = await getAppointmentData();
  //       setAppointmentData(data);
  //     } catch (error) {
  //       console.log("Unable to fetch");
  //     }
  //   };
  //   fetchAppointments();
  // }, []);

  const appointmentData = await getAppointmentData();
  return (
    <div className="ml-4 mr-4 overflow-hidden rounded-xl border-black border-2 p-4">
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
                {appointment.patientName}
              </TableCell>
              <TableCell>
                {new Date(appointment.startTime).toLocaleDateString()}
              </TableCell>
              <TableCell>{appointment.status}</TableCell>
              <TableCell>
                <div className="font-semibold">
                  {new Date(appointment.startTime).toLocaleTimeString()}
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
        <TableFooter></TableFooter>
      </Table>
    </div>
  );
}
