"use client"

import { useForm } from "react-hook-form"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import type * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { AppointmentSchema, LabTestSchema } from "@/src/schemas"
import { useEffect, useState } from "react"
import { appointment } from "@/actions/appointment"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  CheckCircle,
  ClipboardList,
  Clock,
  FileText,
  MapPin,
  Phone,
  User,
  Stethoscope,
  FlaskRoundIcon as Flask,
  ChevronRight,
} from "lucide-react"
import { format } from "date-fns"
import { TimePicker } from "@/src/components/time-picker"
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAllDoctors } from "@/actions/all-doctors"
import { Textarea } from "@/components/ui/textarea"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { bookLabTest } from "@/actions/lab"

interface Doctor {
  id: string
  name: string
  speciality: string
}

export const UnifiedBookingForm = () => {
  const [activeTab, setActiveTab] = useState<"appointment" | "labtest">("appointment")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])

  // Appointment form
  const appointmentForm = useForm<z.infer<typeof AppointmentSchema>>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      name: "",
      reason: "",
      contact: "",
      date: new Date(),
      time: "",
      userId: "",
      doctor: "",
    },
  })

  // Lab test form
  const labTestForm = useForm<z.infer<typeof LabTestSchema>>({
    resolver: zodResolver(LabTestSchema),
    defaultValues: {
      contactInfo: "",
      address: "",
      testType: "BLOOD_TEST",
      customTestRequest: "",
      specialInstructions: "",
      userId: "",
      time: "",
      date: new Date(),
    },
  })

  // Handle appointment submission
  const onAppointmentSubmit = (values: z.infer<typeof AppointmentSchema>) => {
    setIsSubmitting(true)
    appointment(values)
      .then((response) => {
        if (response.error) {
          toast.error(String(response.error))
        } else {
          toast.success(response.success)
          appointmentForm.reset()
          if (response.redirectToPayment && response.paymentId) {
            // Redirect to payment page
            setTimeout(() => {
              window.location.href = `/payment?paymentId=${response.paymentId}&type=appointment`
            }, 1000)
          }
        }
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  // Handle lab test submission
  const onLabTestSubmit = (values: z.infer<typeof LabTestSchema>) => {
    setIsSubmitting(true)
    bookLabTest(values)
      .then((response) => {
        if (response.error) {
          toast.error(String(response.error))
        } else {
          toast.success(response.success)
          labTestForm.reset()
          if (response.redirectToPayment && response.paymentId) {
            // Redirect to payment page
            setTimeout(() => {
              window.location.href = `/payment?paymentId=${response.paymentId}&type=labtest`
            }, 1000)
          }
        }
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  // Fetch doctors for appointment form
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getAllDoctors()
        setDoctors(data)
      } catch (error) {
        console.error("Failed to fetch doctors", error)
      }
    }

    fetchDoctors()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Healthcare Services Booking</h1>
          <p className="text-gray-600">Schedule an appointment or book a lab test with our healthcare professionals</p>
        </div>

        <Card className="border-2 border-orange-200 shadow-lg overflow-hidden">
          <Tabs defaultValue="appointment" onValueChange={(value) => setActiveTab(value as "appointment" | "labtest")}>
            <TabsList className="w-full grid grid-cols-2 bg-orange-50 rounded-none border-orange-200">
              <TabsTrigger
                value="appointment"
                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none py-4"
              >
                <Stethoscope className="h-5 w-5 mr-2" />
                Doctor Appointment
              </TabsTrigger>
              <TabsTrigger
                value="labtest"
                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none py-4"
              >
                <Flask className="h-5 w-5 mr-2" />
                Lab Test
              </TabsTrigger>
            </TabsList>

            {/* Appointment Form */}
            <TabsContent value="appointment" className="p-6 bg-white">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Stethoscope className="h-6 w-6 mr-2 text-orange-500" />
                  Book a Doctor Appointment
                </h2>
                <p className="text-gray-600 mt-1">Schedule a consultation with one of our healthcare professionals</p>
              </div>

              <Form {...appointmentForm}>
                <form onSubmit={appointmentForm.handleSubmit(onAppointmentSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Doctor Selection */}
                    <FormField
                      control={appointmentForm.control}
                      name="doctor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700">
                            <User className="h-4 w-4 mr-2 text-orange-500" />
                            Select Doctor
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-full border-orange-200 focus:ring-orange-500">
                                <SelectValue placeholder="Choose a specialist" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup className="bg-white">
                                  <SelectLabel>Available Doctors</SelectLabel>
                                  {doctors.map((doctor) => (
                                    <SelectItem key={doctor.id} value={doctor.id}>
                                      {doctor.name} - {doctor.speciality}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Name Field */}
                    <FormField
                      control={appointmentForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700">
                            <User className="h-4 w-4 mr-2 text-orange-500" />
                            Patient Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={isSubmitting}
                              placeholder="Enter your full name"
                              className="border-orange-200 focus:ring-orange-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Contact Field */}
                    <FormField
                      control={appointmentForm.control}
                      name="contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700">
                            <Phone className="h-4 w-4 mr-2 text-orange-500" />
                            Contact Number
                          </FormLabel>
                          <FormControl>
                            <PhoneInput
                              {...field}
                              disabled={isSubmitting}
                              placeholder="Enter phone number"
                              defaultCountry="PK"
                              international
                              withCountryCallingCode
                              className="border-orange-200 focus:ring-orange-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Reason Field */}
                    <FormField
                      control={appointmentForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700">
                            <ClipboardList className="h-4 w-4 mr-2 text-orange-500" />
                            Reason for Visit
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={isSubmitting}
                              placeholder="e.g., Headache, Fever, etc."
                              className="border-orange-200 focus:ring-orange-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date Picker */}
                    <FormField
                      control={appointmentForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700">
                            <CalendarIcon className="h-4 w-4 mr-2 text-orange-500" />
                            Appointment Date
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal border-orange-200 focus:ring-orange-500",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Select a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-100" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                className="bg-white"
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Time Picker */}
                    <FormField
                      control={appointmentForm.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700">
                            <Clock className="h-4 w-4 mr-2 text-orange-500" />
                            Appointment Time
                          </FormLabel>
                          <FormControl>
                            <TimePicker
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 rounded-lg font-medium text-lg shadow-md transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          Book Appointment
                          <ChevronRight className="ml-2 h-5 w-5" />
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* Lab Test Form */}
            <TabsContent value="labtest" className="p-6 bg-white">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Flask className="h-6 w-6 mr-2 text-orange-500" />
                  Book a Lab Test
                </h2>
                <p className="text-gray-600 mt-1">Schedule a laboratory test with our certified technicians</p>
              </div>

              <Form {...labTestForm}>
                <form onSubmit={labTestForm.handleSubmit(onLabTestSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information Field */}
                    <FormField
                      control={labTestForm.control}
                      name="contactInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700">
                            <Phone className="h-4 w-4 mr-2 text-orange-500" />
                            Contact Number
                          </FormLabel>
                          <FormControl>
                            <PhoneInput
                              {...field}
                              disabled={isSubmitting}
                              placeholder="Enter phone number"
                              defaultCountry="PK"
                              international
                              withCountryCallingCode
                              className="border-orange-200 focus:ring-orange-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Address Field */}
                    <FormField
                      control={labTestForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700">
                            <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                            Sample Collection Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={isSubmitting}
                              placeholder="Enter your complete address"
                              className="border-orange-200 focus:ring-orange-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date Picker */}
                    <FormField
                      control={labTestForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700">
                            <CalendarIcon className="h-4 w-4 mr-2 text-orange-500" />
                            Test Date
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal border-orange-200 focus:ring-orange-500",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Select a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-100" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                className="bg-white"
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Time Picker */}
                    <FormField
                      control={labTestForm.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700">
                            <Clock className="h-4 w-4 mr-2 text-orange-500" />
                            Preferred Time
                          </FormLabel>
                          <FormControl>
                            <TimePicker
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Test Type Selector */}
                    <FormField
                      control={labTestForm.control}
                      name="testType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700">
                            <Flask className="h-4 w-4 mr-2 text-orange-500" />
                            Type of Test
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-full border-orange-200 focus:ring-orange-500">
                                <SelectValue placeholder="Select a Test Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup className="bg-white">
                                  <SelectLabel>Test Types</SelectLabel>
                                  <SelectItem value="BLOOD_TEST">Blood Test</SelectItem>
                                  <SelectItem value="URINE_TEST">Urine Test</SelectItem>
                                  <SelectItem value="STOOL_TEST">Stool Test</SelectItem>
                                  <SelectItem value="COVID_TEST">COVID Test</SelectItem>
                                  <SelectItem value="DIABETES_MONITORING">Diabetes Monitoring</SelectItem>
                                  <SelectItem value="CHOLESTEROL_CHECK">Cholesterol Check</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Custom Test Request Field */}
                  <FormField
                    control={labTestForm.control}
                    name="customTestRequest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700">
                          <FileText className="h-4 w-4 mr-2 text-orange-500" />
                          Custom Test Request (Optional)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            disabled={isSubmitting}
                            placeholder="Specify any custom test requirements or upload a prescription"
                            className="border-orange-200 focus:ring-orange-500 min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Special Instructions Field */}
                  <FormField
                    control={labTestForm.control}
                    name="specialInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700">
                          <ClipboardList className="h-4 w-4 mr-2 text-orange-500" />
                          Special Instructions (Optional)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            disabled={isSubmitting}
                            placeholder="Any special requirements or medical conditions we should know about"
                            className="border-orange-200 focus:ring-orange-500 min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 rounded-lg font-medium text-lg shadow-md transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          Book Lab Test
                          <ChevronRight className="ml-2 h-5 w-5" />
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-md">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Booking</h3>
            <p className="text-gray-600">
              Book appointments and lab tests in just a few clicks with our streamlined process.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-md">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Scheduling</h3>
            <p className="text-gray-600">
              Choose from a wide range of available time slots that fit your busy schedule.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-md">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Home Collection</h3>
            <p className="text-gray-600">
              Our technicians will visit your home for sample collection at your preferred time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
