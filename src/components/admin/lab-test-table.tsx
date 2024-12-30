"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLabTestData } from "@/data/lab-test-data";

export async function LabTestTable() {
  const labTestData = await getLabTestData();

  return (
    <div className="ml-4 mr-4 overflow-hidden rounded-xl border-black border-2 p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Patient Id</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Test Type</TableHead>
            <TableHead className="text-right">Contact Info</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {labTestData?.map((lab) => (
            <TableRow key={lab.id}>
              <TableCell>{lab.id || "N/A"}</TableCell>
              <TableCell>
                {new Date(lab.testStartTime).toLocaleDateString()}
              </TableCell>
              <TableCell>{lab.status || "N/A"}</TableCell>
              <TableCell>{lab.testEndTime.toLocaleTimeString()}</TableCell>
              <TableCell className="text-right">
                {lab.testType || "N/A"}
              </TableCell>
              <TableCell className="text-right">
                {lab.contactInfo || "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter></TableFooter>
      </Table>
    </div>
  );
}
