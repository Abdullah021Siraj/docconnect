"use client"

import React, { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, TestTube, Users, Clock, CheckCircle, XCircle, AlertCircle, Activity, TrendingUp, Loader2, RefreshCw, Download, Filter, Search, Eye, Edit, Trash2 } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { getAppointmentData } from "@/data/appointment-data"
import { getLabTestData } from "@/data/lab-test-data"
import { useCurrentRole } from "@/hooks/use-current-role"

interface Appointment {
  id: string
  patientName: string
  startTime: string
  status: "CONFIRMED" | "CANCELLED" | "PENDING"
  doctor?: {
    name: string
    speciality: string
  }
  roomId?: string
}

interface LabTest {
  id?: string
  testStartTime?: string | null
  testEndTime?: string | null
  testType?: string
  contactInfo?: string
  status: "SCHEDULED" | "CANCELLED" | "PENDING"
  patientName?: string
  priority?: "LOW" | "MEDIUM" | "HIGH"
}

const AdminDashboard = () => {
  const [appointmentData, setAppointmentData] = useState<Appointment[]>([])
  const [labData, setLabData] = useState<LabTest[]>([])
  const [appointmentError, setAppointmentError] = useState<string | null>(null)
  const [labError, setLabError] = useState<string | null>(null)
  const [appointmentLoading, setAppointmentLoading] = useState(true)
  const [labLoading, setLabLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const userRole = useCurrentRole()
  const isAdmin = userRole === "ADMIN"

  // Fetch appointment data
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isAdmin) return
      
      try {
        setAppointmentLoading(true)
        const data = await getAppointmentData()
        setAppointmentData(data)
      } catch (err) {
        setAppointmentError("Unable to fetch appointment data.")
        console.error("Unable to fetch appointments:", err)
      } finally {
        setAppointmentLoading(false)
      }
    }

    fetchAppointments()
  }, [isAdmin])

  // Fetch lab test data
  useEffect(() => {
    const fetchLabTests = async () => {
      if (!isAdmin) return
      
      try {
        setLabLoading(true)
        const data = await getLabTestData()
        // Add mock patient names and priorities for better demo
        const enhancedData = data.map((test, index) => ({
          ...test,
          patientName: `Patient ${String(index + 1).padStart(3, '0')}`,
          priority: ["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)] as "LOW" | "MEDIUM" | "HIGH"
        }))
        setLabData(enhancedData)
      } catch (error) {
        setLabError("Unable to fetch lab test data.")
        console.error("Unable to fetch lab tests:", error)
      } finally {
        setLabLoading(false)
      }
    }

    fetchLabTests()
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#FF685B]/5 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-[#FF685B]/20 bg-[#FF685B]/5">
            <AlertCircle className="h-4 w-4 text-[#FF685B]" />
            <AlertTitle className="text-[#FF685B]">Access Restricted</AlertTitle>
            <AlertDescription className="text-gray-700">
              You need administrator privileges to view this dashboard. Please contact your system administrator for access.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const appointmentStats = {
    total: appointmentData.length,
    confirmed: appointmentData.filter(apt => apt.status === "CONFIRMED").length,
    cancelled: appointmentData.filter(apt => apt.status === "CANCELLED").length,
    pending: appointmentData.filter(apt => apt.status === "PENDING").length,
  }

  const labStats = {
    total: labData.length,
    scheduled: labData.filter(lab => lab.status === "SCHEDULED").length,
    cancelled: labData.filter(lab => lab.status === "CANCELLED").length,
    pending: labData.filter(lab => lab.status === "PENDING").length,
  }

  // Filter functions
  const filteredAppointments = appointmentData.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctor?.speciality.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || appointment.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const filteredLabTests = labData.filter(test => {
    const matchesSearch = test.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.testType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.id?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || test.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
      case "SCHEDULED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmed</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <Badge variant="destructive">High</Badge>
      case "MEDIUM":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Medium</Badge>
      case "LOW":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Low</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend 
  }: { 
    title: string
    value: number
    icon: React.ElementType
    color: string
    trend?: number 
  }) => (
    <Card className="hover:shadow-lg transition-all duration-300 border border-[#FF685B]/20 bg-gradient-to-br from-white to-[#FF685B]/5">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">+{trend}% from last week</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Appointments"
          value={appointmentStats.total}
          icon={Calendar}
          color="bg-gradient-to-r from-[#FF685B] to-[#FF8A7A]"
          trend={12}
        />
        <StatCard
          title="Confirmed Appointments"
          value={appointmentStats.confirmed}
          icon={CheckCircle}
          color="bg-gradient-to-r from-green-500 to-green-600"
          trend={8}
        />
        <StatCard
          title="Total Lab Tests"
          value={labStats.total}
          icon={TestTube}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          trend={15}
        />
        <StatCard
          title="Scheduled Tests"
          value={labStats.scheduled}
          icon={Activity}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          trend={5}
        />
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Overview */}
        <Card className="shadow-lg border border-[#FF685B]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-[#FF685B]" />
              Appointments Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-800">Confirmed</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{appointmentStats.confirmed}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium text-yellow-800">Pending</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{appointmentStats.pending}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-red-800">Cancelled</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{appointmentStats.cancelled}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lab Tests Overview */}
        <Card className="shadow-lg border border-[#FF685B]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TestTube className="h-5 w-5 text-[#FF685B]" />
              Lab Tests Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-blue-800">Scheduled</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{labStats.scheduled}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium text-yellow-800">Pending</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{labStats.pending}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-red-800">Cancelled</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{labStats.cancelled}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const AppointmentsTab = () => (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card className="shadow-lg border border-[#FF685B]/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card className="shadow-lg border border-[#FF685B]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#FF685B]" />
            Appointments ({filteredAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {appointmentLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF685B] mx-auto mb-4" />
                <p className="text-gray-500">Loading appointments...</p>
              </div>
            </div>
          ) : appointmentError ? (
            <div className="text-center text-red-500 p-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p>{appointmentError}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#FF685B]/10 to-white">
                    <TableHead className="font-semibold">Patient</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Time</TableHead>
                    <TableHead className="font-semibold">Doctor</TableHead>
                    <TableHead className="font-semibold">Specialty</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment, index) => (
                    <TableRow key={appointment.id || `appointment-${index}`} className="hover:bg-[#FF685B]/5">
                      <TableCell className="font-medium">{appointment.patientName || "Unknown"}</TableCell>
                      <TableCell>
                        {appointment.startTime
                          ? new Date(appointment.startTime).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {appointment.startTime
                          ? new Date(appointment.startTime).toLocaleTimeString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>{appointment.doctor?.name || "N/A"}</TableCell>
                      <TableCell>{appointment.doctor?.speciality || "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const LabTestsTab = () => (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card className="shadow-lg border border-[#FF685B]/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search lab tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lab Tests Table */}
      <Card className="shadow-lg border border-[#FF685B]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-[#FF685B]" />
            Lab Tests ({filteredLabTests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {labLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF685B] mx-auto mb-4" />
                <p className="text-gray-500">Loading lab tests...</p>
              </div>
            </div>
          ) : labError ? (
            <div className="text-center text-red-500 p-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p>{labError}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#FF685B]/10 to-white">
                    <TableHead className="font-semibold">Test ID</TableHead>
                    <TableHead className="font-semibold">Patient</TableHead>
                    <TableHead className="font-semibold">Test Type</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Time</TableHead>
                    <TableHead className="font-semibold">Priority</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLabTests.map((test, index) => (
                    <TableRow key={test.id || `test-${index}`} className="hover:bg-[#FF685B]/5">
                      <TableCell className="font-medium">{test.id || "N/A"}</TableCell>
                      <TableCell>{test.patientName || "Unknown"}</TableCell>
                      <TableCell>{test.testType || "N/A"}</TableCell>
                      <TableCell>
                        {test.testStartTime
                          ? new Date(test.testStartTime).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {test.testStartTime
                          ? new Date(test.testStartTime).toLocaleTimeString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>{getPriorityBadge(test.priority || "LOW")}</TableCell>
                      <TableCell>{getStatusBadge(test.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#FF685B]/5 p-4 sm:p-6 w-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF685B] to-[#FF8A7A] bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Manage appointments and lab tests efficiently</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-[#FF685B]/30 text-[#FF685B] hover:bg-[#FF685B]/10"
              asChild
            >
              <Link href="/user">
                <Users className="h-4 w-4 mr-2" />
                User Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-[#FF685B]/20">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF685B] data-[state=active]:to-[#FF8A7A] data-[state=active]:text-white"
            >
              <Activity className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="appointments"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF685B] data-[state=active]:to-[#FF8A7A] data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Appointments</span>
            </TabsTrigger>
            <TabsTrigger 
              value="lab-tests"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF685B] data-[state=active]:to-[#FF8A7A] data-[state=active]:text-white"
            >
              <TestTube className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Lab Tests</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            <AppointmentsTab />
          </TabsContent>

          <TabsContent value="lab-tests" className="mt-6">
            <LabTestsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminDashboard
