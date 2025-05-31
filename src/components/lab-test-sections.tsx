"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TestTube, Plus, FileText, AlertCircle, Loader2, Download, Calendar, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { getLabTestData } from "@/data/lab-test-data"

interface LabTest {
  id: string
  testType: string
  testStartTime: string
  status: "CONFIRMED" | "CANCELLED" | "PENDING" | "COMPLETED"
  address?: string
  results?: {
    available: boolean
    url?: string
  }
}

export const LabTestsSection = ({ userId }: { userId?: string }) => {
  const [labTests, setLabTests] = useState<LabTest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLabTests = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch real data from database
        const data = await getLabTestData(userId)
        setLabTests(data)
      } catch (err) {
        setError(err.message || "Failed to load lab tests")
      } finally {
        setLoading(false)
      }
    }

    fetchLabTests()
  }, [userId])

  // Format test type for display
  const formatTestType = (testType: string) => {
    return testType.replace(/_/g, " ")
  }

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-blue-500">Confirmed</Badge>
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-yellow-500 text-white">
            Pending
          </Badge>
        )
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-500">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF685B] mx-auto mb-4" />
          <p className="text-gray-500">Loading your lab tests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <p>{error}</p>
        <Button className="mt-4 bg-gradient-to-r from-[#FF685B] to-[#FF8A7A]" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <TestTube className="h-6 w-6 mr-2 text-[#FF685B]" />
            Lab Tests
          </h3>
          <p className="text-sm text-gray-500 mt-1">Manage your lab tests and view results</p>
        </div>
        <Button
          className="flex items-center gap-2 bg-gradient-to-r from-[#FF685B] to-[#FF8A7A] hover:from-[#FF685B]/90 hover:to-[#FF8A7A]/90 w-full sm:w-auto"
          asChild
        >
          <Link href="/booking">
            <Plus className="h-4 w-4" />
            Book New Lab Test
          </Link>
        </Button>
      </div>

      {labTests.length === 0 ? (
        <Card className="border border-[#FF685B]/20 shadow-md p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-[#FF685B]/10 rounded-full flex items-center justify-center mb-4">
            <TestTube className="h-8 w-8 text-[#FF685B]" />
          </div>
          <h4 className="text-lg font-semibold mb-2">No Lab Tests Found</h4>
          <p className="text-gray-500 mb-6">You haven't booked any lab tests yet.</p>
          <Button className="bg-gradient-to-r from-[#FF685B] to-[#FF8A7A]" asChild>
            <Link href="/lab">Book Your First Test</Link>
          </Button>
        </Card>
      ) : (
        <Card className="shadow-lg border border-[#FF685B]/20 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-[#FF685B]/10 to-white">
                <TableHead className="font-semibold text-xs sm:text-sm">Test Type</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm">Date & Time</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm">Status</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm">Results</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm">Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labTests.map((test) => (
                <TableRow key={test.id} className="hover:bg-[#FF685B]/5">
                  <TableCell className="font-medium text-xs sm:text-sm">{formatTestType(test.testType)}</TableCell>
                  <TableCell>
                    <div className="text-xs sm:text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-[#FF685B]" />
                        <p className="font-medium">
                          {new Date(test.testStartTime).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1 text-[#FF685B]" />
                        <p className="text-gray-500">
                          {new Date(test.testStartTime).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(test.status)}</TableCell>
                  <TableCell>
                    {test.status === "COMPLETED" ? (
                      test.results?.available ? (
                        <Badge className="bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                          <FileText className="h-3 w-3" />
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500 flex items-center gap-1 w-fit">
                          Pending
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline" className="text-gray-500 flex items-center gap-1 w-fit">
                        Not Available
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {test.results?.available && test.results?.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 w-full sm:w-auto text-xs sm:text-sm"
                          asChild
                        >
                          <a href={test.results.url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3 w-3 mr-1" />
                            Results
                          </a>
                        </Button>
                      )}
                      {test.status === "CONFIRMED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50 w-full sm:w-auto text-xs sm:text-sm"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          {test.address}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
