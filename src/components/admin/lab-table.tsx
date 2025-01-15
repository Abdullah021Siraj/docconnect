"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLabTestData } from "@/data/lab-test-data";
import { useEffect, useState } from "react";
import { LabDashboardCards } from "./lab-cards";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCurrentRole } from "@/hooks/use-current-role";
import { Card, CardContent, CardHeader } from "../ui/card";

type LabTest = {
  id?: string;
  testStartTime?: string | null;
  testEndTime?: string | null;
  // status?: string;
  testType?: string;
  contactInfo?: string;
  status: 'SCHEDULED' | 'CANCELLED' | 'PENDING';
};

export function LabTestTable() {
  const [labData, setLabData] = useState<LabTest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const userRole = useCurrentRole();
    const isAdmin = userRole === 'ADMIN';

  useEffect(() => {
    const fetchLabTests = async () => {
      try {
        const data = await getLabTestData();
        setLabData(data);
      } catch (error) {
        setError("Unable to fetch lab test data.");
        console.error("Unable to fetch lab tests:", error);
      }
    };
    if(isAdmin){
    fetchLabTests();
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

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (labData.length === 0) {
    return <div className="text-gray-500 p-4">No lab tests available.</div>;
  }

  const scheduledTests = labData.filter(lab => lab.status === 'SCHEDULED');
  const cancelledTests = labData.filter(lab => lab.status === 'CANCELLED');
  const pendingTests = labData.filter(lab => lab.status === 'PENDING');

  return (
    <>
      <div className="ml-4 mr-4 overflow-hidden rounded-xl border-black border-2 p-4 w-[1600px]">
      <Card className="mb-6">
          <CardHeader className="text-xl font-bold">Lab Tests Summary</CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Scheduled Tests</h3>
                <p className="text-2xl font-bold text-blue-600">{scheduledTests.length}</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800">Cancelled Tests</h3>
                <p className="text-2xl font-bold text-red-600">{cancelledTests.length}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800">Pending Tests</h3>
                <p className="text-2xl font-bold text-yellow-600">{pendingTests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Patient ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Test Type</TableHead>
              <TableHead className="text-right">Contact Info</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {labData.map((lab) => (
              <TableRow key={lab.id || Math.random()}>
                <TableCell>{lab.id || "N/A"}</TableCell>
                <TableCell>
                  {lab.testStartTime
                    ? new Date(lab.testStartTime).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>{lab.status || "N/A"}</TableCell>
                <TableCell>
                  {lab.testEndTime
                    ? new Date(lab.testEndTime).toLocaleTimeString()
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  {lab.testType || "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  {lab.contactInfo || "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
