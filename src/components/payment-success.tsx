"use client"

import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { CheckCircle, Calendar, Clock, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

interface PaymentSuccessProps {
  type: "appointment" | "labtest"
  bookingDetails: any
  roomId?: string
}

export const PaymentSuccess = ({ type, bookingDetails, roomId }: PaymentSuccessProps) => {
  const router = useRouter()

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-[600px] p-8 border-2 border-orange-200">
        <div className="text-center mb-6">
          <CheckCircle className="mx-auto h-16 w-16 text-orange-600 mb-4" />
          <h1 className="text-3xl font-bold text-black">Payment Successful!</h1>
          <p className="text-gray-600 mt-2">
            Your {type === "appointment" ? "appointment" : "lab test"} has been confirmed.
          </p>
        </div>

        <div className="bg-orange-50 border-xl p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Booking Details</h3>

          {type === "appointment" ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-orange-600" />
                <span>Date: {new Date(bookingDetails.startTime).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-orange-600" />
                <span>Time: {new Date(bookingDetails.startTime).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-orange-600" />
                <span>Doctor: {bookingDetails.doctor?.name}</span>
              </div>
              {roomId && (
                <div className="mt-4 p-3 bg-black text-white rounded">
                  <strong>Room ID: {roomId}</strong>
                  <p className="text-sm text-gray-100">Use this Room ID to join your video consultation</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-orange-600" />
                <span>Date: {new Date(bookingDetails.testStartTime).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-orange-600" />
                <span>Time: {new Date(bookingDetails.testStartTime).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-orange-600" />
                <span>Test Type: {bookingDetails.testType.replace("_", " ")}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Button onClick={() => router.push("/user")} className="w-full bg-black text-white hover:bg-orange-700">
            Go to Dashboard
          </Button>

          <Button variant="outline" onClick={() => router.push("/")} className="hover:bg-orange-700 w-full bg-black text-white">
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  )
}
