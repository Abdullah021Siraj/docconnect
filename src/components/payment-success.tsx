"use client"

import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { CheckCircle, Calendar, Clock, MapPin, FileText, ArrowRight, Share2, Home, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"

interface PaymentSuccessProps {
  type: "appointment" | "labtest"
  bookingDetails: any
  roomId?: string
}

export const PaymentSuccess = ({ type, bookingDetails, roomId }: PaymentSuccessProps) => {
  const router = useRouter()
  const [showShareOptions, setShowShareOptions] = useState(false)

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Generate calendar invite
  const generateCalendarInvite = () => {
    // Implementation would go here
    alert("Calendar invite feature will be implemented soon!")
  }

  // Share booking details
  const shareBookingDetails = () => {
    if (navigator.share) {
      navigator.share({
        title: `${type === "appointment" ? "Doctor Appointment" : "Lab Test"} Confirmation`,
        text: `My ${type === "appointment" ? "appointment" : "lab test"} is confirmed for ${formatDate(
          type === "appointment" ? bookingDetails.startTime : bookingDetails.testStartTime,
        )} at ${formatTime(type === "appointment" ? bookingDetails.startTime : bookingDetails.testStartTime)}`,
        url: window.location.href,
      })
    } else {
      setShowShareOptions(!showShareOptions)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-white py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="overflow-hidden border-2 border-orange-200 shadow-xl">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 text-center relative overflow-hidden">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="h-12 w-12 text-orange-500" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-orange-100 text-lg">
              Your {type === "appointment" ? "appointment" : "lab test"} has been confirmed
            </p>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
          </div>

          {/* Booking Details */}
          <div className="p-8">
            <div className="bg-orange-50 rounded-xl p-6 mb-6 border border-orange-100">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-orange-500" />
                Booking Details
              </h3>

              <div className="space-y-4">
                {type === "appointment" ? (
                  <>
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-3 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium text-gray-900">{formatDate(bookingDetails.startTime)}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-3 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium text-gray-900">{formatTime(bookingDetails.startTime)}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <User className="h-5 w-5 mr-3 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Doctor</p>
                        <p className="font-medium text-gray-900">
                          {bookingDetails.doctor?.name || "Not assigned"}
                          {bookingDetails.doctor?.speciality && (
                            <span className="text-sm text-gray-500 ml-2">({bookingDetails.doctor.speciality})</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {roomId && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-bold">Room ID: {roomId}</p>
                          <p className="text-sm text-orange-100">Use this Room ID to join your video consultation</p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => router.push(`/room/${roomId}`)}
                          className="whitespace-nowrap"
                        >
                          Join Now
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-3 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium text-gray-900">{formatDate(bookingDetails.testStartTime)}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-3 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium text-gray-900">{formatTime(bookingDetails.testStartTime)}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-3 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Test Type</p>
                        <p className="font-medium text-gray-900">{bookingDetails.testType.replace(/_/g, " ")}</p>
                      </div>
                    </div>

                    {bookingDetails.address && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-3 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Sample Collection Address</p>
                          <p className="font-medium text-gray-900">{bookingDetails.address}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Additional information */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
              <p className="text-blue-800 text-sm flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" />
                <span>A confirmation email has been sent to your registered email address with all the details.</span>
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => router.push("/user")}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={generateCalendarInvite}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Calendar
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={shareBookingDetails}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Details
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-4">
          Need help? Contact our support team at support@healthhub.com
        </p>
      </motion.div>
    </div>
  )
}
