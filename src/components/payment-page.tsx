"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Clock,
  User,
  CreditCard,
  Shield,
  CheckCircle,
  ArrowLeft,
  Stethoscope,
  TestTube,
  MapPin,
  Phone,
  Mail,
  DollarSign,
} from "lucide-react"
import { StripePaymentForm } from "@/src/components/stripe-payment-form"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface PaymentPageComponentProps {
  paymentId: string
  amount: number
  type: "appointment" | "labtest"
  description: string
  bookingData: any
  user: any
}

export const PaymentPageComponent = ({
  paymentId,
  amount,
  type,
  description,
  bookingData,
  user,
}: PaymentPageComponentProps) => {
  const router = useRouter()

  // Format amount for display
  const formatAmount = (cents: number) => {
    return (cents)
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
            <p className="text-gray-600">Secure payment processing for your healthcare booking</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-2 border-orange-200 shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {type === "appointment" ? <Stethoscope className="h-6 w-6" /> : <TestTube className="h-6 w-6" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{type === "appointment" ? "Doctor Appointment" : "Lab Test"}</h2>
                    <p className="text-orange-100">Booking Summary</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Patient Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-orange-500" />
                    Patient Information
                  </h3>
                  <div className="bg-orange-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">
                        {type === "appointment" ? bookingData.patientName : user.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">{user.email}</span>
                    </div>
                    {type === "appointment" && bookingData.patientContact && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Contact:</span>
                        <span className="font-medium text-gray-900">{bookingData.patientContact}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Booking Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                    Booking Details
                  </h3>
                  <div className="space-y-4">
                    {type === "appointment" ? (
                      <>
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium text-gray-900">{formatDate(bookingData.startTime)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Time</p>
                            <p className="font-medium text-gray-900">{formatTime(bookingData.startTime)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Stethoscope className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Doctor</p>
                            <p className="font-medium text-gray-900">{bookingData.doctor?.name || "Not assigned"}</p>
                            {bookingData.doctor?.speciality && (
                              <p className="text-sm text-gray-500">{bookingData.doctor.speciality}</p>
                            )}
                          </div>
                        </div>

                        {bookingData.reason && (
                          <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-orange-500 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Reason for Visit</p>
                              <p className="font-medium text-gray-900">{bookingData.reason}</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Test Date</p>
                            <p className="font-medium text-gray-900">{formatDate(bookingData.testStartTime)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Test Time</p>
                            <p className="font-medium text-gray-900">{formatTime(bookingData.testStartTime)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <TestTube className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Test Type</p>
                            <p className="font-medium text-gray-900">{bookingData.testType.replace(/_/g, " ")}</p>
                          </div>
                        </div>

                        {bookingData.address && (
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Sample Collection Address</p>
                              <p className="font-medium text-gray-900">{bookingData.address}</p>
                            </div>
                          </div>
                        )}

                        {bookingData.contactInfo && (
                          <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-orange-500 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Contact Number</p>
                              <p className="font-medium text-gray-900">{bookingData.contactInfo}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Payment Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-orange-500" />
                    Payment Summary
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{type === "appointment" ? "Consultation Fee" : "Test Fee"}</span>
                      <span className="font-medium text-gray-900">Rs. {formatAmount(amount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Processing Fee</span>
                      <span className="font-medium text-gray-900">Rs. 0.00</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span className="text-gray-900">Total Amount</span>
                      <span className="text-orange-600">Rs.{formatAmount(amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Secure Payment</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your payment information is encrypted and secure. We use industry-standard SSL encryption to
                        protect your data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-2 border-orange-200 shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Payment Information</h2>
                    <p className="text-orange-100">Enter your payment details</p>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="p-6">
                <StripePaymentForm paymentId={paymentId} amount={amount} type={type} description={description} />
              </div>
            </Card>

            {/* Trust Indicators */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Card className="p-4 text-center border border-orange-200">
                <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">SSL Secured</h4>
                <p className="text-xs text-gray-500">256-bit encryption</p>
              </Card>

              <Card className="p-4 text-center border border-orange-200">
                <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">PCI Compliant</h4>
                <p className="text-xs text-gray-500">Secure processing</p>
              </Card>
            </div>

            {/* Help Section */}
            <Card className="mt-6 p-4 bg-blue-50 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
              <p className="text-sm text-blue-700 mb-3">
                If you're experiencing any issues with payment, please contact our support team.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700">(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700 py-1">support@docconnect.com</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
