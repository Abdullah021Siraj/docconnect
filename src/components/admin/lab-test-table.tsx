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

type LabTest = {
  id?: string;
  testStartTime?: string | null;
  testEndTime?: string | null;
  status?: string;
  testType?: string;
  contactInfo?: string;
};

export function LabTestTable() {
  const [labData, setLabData] = useState<LabTest[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    fetchLabTests();
  }, []);

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (labData.length === 0) {
    return <div className="text-gray-500 p-4">No lab tests available.</div>;
  }

  return (
    <div className="ml-4 mr-4 overflow-hidden rounded-xl border-black border-2 p-4">
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
  );
}
