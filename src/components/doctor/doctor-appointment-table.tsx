"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  TrendingUp,
  Loader2,
  RefreshCw,
  Search,
  Eye,
  Edit,
  Users,
  Stethoscope,
  FileText,
  Phone,
  MapPin,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCurrentRole } from "@/hooks/use-current-role"
import { useCurrentUser } from "@/hooks/use-current-user"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { getDoctorAppointments, updateAppointmentStatus } from "@/actions/doctor-actions"

interface Appointment {
  id: string
  patientName: string
  patientContact?: string
  startTime: string
  endTime: string
  status: "CONFIRMED" | "PENDING" | "CANCELLED" | "COMPLETED"
  roomId?: string
  notes?: string
}

interface PatientInfo {
  name: string
  contact: string
  email?: string
  address?: string
  medicalHistory?: string
  allergies?: string
  currentMedications?: string
}

const DoctorDashboard: React.FC = () => {
  const [appointmentData, setAppointmentData] = useState<Appointment[]>([])
  const [appointmentLoading, setAppointmentLoading] = useState(true)
  const [appointmentError, setAppointmentError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false)
  const [appointmentNotes, setAppointmentNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const userRole = useCurrentRole()
  const currentUser = useCurrentUser()
  const isDoctor = userRole === "DOCTOR" || userRole === "ADMIN"

  // Fetch appointment data
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isDoctor || !currentUser?.id) return

      try {
        setAppointmentLoading(true)
        const result = await getDoctorAppointments(currentUser.id)
        if (result.success) {
          setAppointmentData(result.data || [])
          setAppointmentError(null)
        } else {
          setAppointmentError(result.error || "Failed to fetch appointments")
        }
      } catch (err) {
        setAppointmentError("Unable to fetch appointment data.")
        console.error("Unable to fetch appointments:", err)
      } finally {
        setAppointmentLoading(false)
      }
    }

    fetchAppointments()
  }, [isDoctor, currentUser?.id])

  if (!isDoctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#FF685B]/5 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-[#FF685B]/20 bg-[#FF685B]/5">
            <AlertCircle className="h-4 w-4 text-[#FF685B]" />
            <AlertTitle className="text-[#FF685B]">Access Restricted</AlertTitle>
            <AlertDescription className="text-gray-700">
              You need doctor privileges to view this dashboard. Please contact your system administrator for access.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const appointmentStats = {
    total: appointmentData.length,
    today: appointmentData.filter((apt) => {
      const today = new Date().toDateString()
      return new Date(apt.startTime).toDateString() === today
    }).length,
    confirmed: appointmentData.filter((apt) => apt.status === "CONFIRMED").length,
    pending: appointmentData.filter((apt) => apt.status === "PENDING").length,
    completed: appointmentData.filter((apt) => apt.status === "COMPLETED").length,
  }

  // Filter functions
  const filteredAppointments = appointmentData.filter((appointment) => {
    const matchesSearch =
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientContact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.roomId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || appointment.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmed</Badge>
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Completed</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    if (!currentUser?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      const result = await updateAppointmentStatus(
        { id: appointmentId, status: newStatus as "CONFIRMED" | "PENDING" | "CANCELLED" | "COMPLETED" },
        currentUser.id,
      )

      if (result.success) {
        setAppointmentData((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId
              ? { ...apt, status: newStatus as "CONFIRMED" | "PENDING" | "CANCELLED" | "COMPLETED" }
              : apt,
          ),
        )
        toast({
          title: "Success",
          description: "Appointment status updated successfully",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Status update error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsViewDialogOpen(true)
  }

  const handleAddNotes = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setAppointmentNotes(appointment.notes || "")
    setIsNotesDialogOpen(true)
  }

  const handleSaveNotes = async () => {
    if (!selectedAppointment || !currentUser?.id) return

    setIsUpdating(true)
    try {
      // Here you would call a server action to save notes
      // For now, we'll update locally
      setAppointmentData((prev) =>
        prev.map((apt) => (apt.id === selectedAppointment.id ? { ...apt, notes: appointmentNotes } : apt)),
      )

      toast({
        title: "Success",
        description: "Notes saved successfully",
      })
      setIsNotesDialogOpen(false)
      setSelectedAppointment(null)
      setAppointmentNotes("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const refreshData = async () => {
    if (!isDoctor || !currentUser?.id) return

    setAppointmentLoading(true)
    try {
      const result = await getDoctorAppointments(currentUser.id)
      if (result.success) {
        setAppointmentData(result.data || [])
        setAppointmentError(null)
        toast({
          title: "Success",
          description: "Data refreshed successfully",
        })
      } else {
        setAppointmentError(result.error || "Failed to fetch appointments")
      }
    } catch (error) {
      console.error("Refresh error:", error)
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      })
    } finally {
      setAppointmentLoading(false)
    }
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
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
          trend={8}
        />
        <StatCard
          title="Today's Appointments"
          value={appointmentStats.today}
          icon={Clock}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          trend={12}
        />
        <StatCard
          title="Confirmed"
          value={appointmentStats.confirmed}
          icon={CheckCircle}
          color="bg-gradient-to-r from-green-500 to-green-600"
          trend={5}
        />
        <StatCard
          title="Completed"
          value={appointmentStats.completed}
          icon={Activity}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          trend={15}
        />
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card className="shadow-lg border border-[#FF685B]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-[#FF685B]" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointmentData
                .filter((apt) => {
                  const today = new Date().toDateString()
                  return new Date(apt.startTime).toDateString() === today
                })
                .slice(0, 5)
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{appointment.patientName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                ))}
              {appointmentStats.today === 0 && (
                <p className="text-center text-gray-500 py-4">No appointments scheduled for today</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-lg border border-[#FF685B]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5 text-[#FF685B]" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                className="w-full justify-start bg-gradient-to-r from-[#FF685B] to-[#FF8A7A] hover:from-[#FF685B]/90 hover:to-[#FF8A7A]/90"
                onClick={() => setActiveTab("appointments")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                View All Appointments
              </Button>
              <Button variant="outline" className="w-full justify-start border-[#FF685B]/30 text-[#FF685B]">
                <FileText className="h-4 w-4 mr-2" />
                Patient Records
              </Button>
              <Button variant="outline" className="w-full justify-start border-[#FF685B]/30 text-[#FF685B]">
                <Users className="h-4 w-4 mr-2" />
                Schedule Management
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-[#FF685B]/30 text-[#FF685B]"
                onClick={refreshData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={refreshData} className="flex-1 sm:flex-none">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card className="shadow-lg border border-[#FF685B]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#FF685B]" />
            My Appointments ({filteredAppointments.length})
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
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Room</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id} className="hover:bg-[#FF685B]/5">
                      <TableCell className="font-medium">{appointment.patientName}</TableCell>
                      <TableCell>{new Date(appointment.startTime).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {new Date(appointment.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>{appointment.patientContact || "N/A"}</TableCell>
                      <TableCell>{appointment.roomId || "TBD"}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                            onClick={() => handleViewAppointment(appointment)}
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-green-100"
                            onClick={() => handleAddNotes(appointment)}
                          >
                            <Edit className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-[#FF685B]/10"
                            onClick={() => handleStatusChange(appointment.id, "COMPLETED")}
                            disabled={isUpdating || appointment.status === "COMPLETED"}
                          >
                            <CheckCircle className="h-4 w-4 text-[#FF685B]" />
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
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-[#FF685B]/5 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF685B] to-[#FF8A7A] bg-clip-text text-transparent">
              Doctor Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome back, Dr. {currentUser?.name || "Doctor"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-[#FF685B]/30 text-[#FF685B] hover:bg-[#FF685B]/10">
              <Stethoscope className="h-4 w-4 mr-2" />
              My Profile
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-[#FF685B]/20">
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
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            <AppointmentsTab />
          </TabsContent>
        </Tabs>

        {/* View Appointment Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#FF685B]" />
                Appointment Details
              </DialogTitle>
            </DialogHeader>

            {selectedAppointment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Patient Name</Label>
                    <p className="text-lg font-semibold">{selectedAppointment.patientName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date</Label>
                    <p className="text-lg">{new Date(selectedAppointment.startTime).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Time</Label>
                    <p className="text-lg">
                      {new Date(selectedAppointment.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Contact</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <p className="text-lg">{selectedAppointment.patientContact || "N/A"}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Room</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <p className="text-lg">{selectedAppointment.roomId || "TBD"}</p>
                    </div>
                  </div>
                </div>
                {selectedAppointment.notes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Notes</Label>
                    <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded-lg">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Notes Dialog */}
        <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#FF685B]" />
                Add Appointment Notes
              </DialogTitle>
              <DialogDescription>
                Add or update notes for {selectedAppointment?.patientName}'s appointment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  placeholder="Enter appointment notes, observations, or treatment details..."
                  rows={6}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveNotes}
                disabled={isUpdating}
                className="bg-gradient-to-r from-[#FF685B] to-[#FF8A7A] hover:from-[#FF685B]/90 hover:to-[#FF8A7A]/90"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Notes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default DoctorDashboard
