"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { CreditCard, Lock, Loader2, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { createPaymentIntent, confirmAppointmentPayment, confirmLabTestPayment } from "@/actions/payment"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

interface StripePaymentFormProps {
  paymentId: string
  amount: number
  type: "appointment" | "labtest"
  description: string
}

export const StripePaymentForm = ({ paymentId, amount, type, description }: StripePaymentFormProps) => {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<"form" | "processing" | "success">("form")

  // Mock payment form state
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    billingAddress: "",
    city: "",
    zipCode: "",
  })

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value

    if (field === "cardNumber") {
      formattedValue = formatCardNumber(value)
    } else if (field === "expiryDate") {
      formattedValue = formatExpiryDate(value)
    } else if (field === "cvv") {
      formattedValue = value.replace(/[^0-9]/g, "").substring(0, 4)
    }

    setFormData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }))
  }

  const validateForm = () => {
    const { cardNumber, expiryDate, cvv, cardholderName } = formData

    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
      toast.error("Please enter a valid card number")
      return false
    }

    if (!expiryDate || expiryDate.length < 5) {
      toast.error("Please enter a valid expiry date")
      return false
    }

    if (!cvv || cvv.length < 3) {
      toast.error("Please enter a valid CVV")
      return false
    }

    if (!cardholderName.trim()) {
      toast.error("Please enter the cardholder name")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsProcessing(true)
    setPaymentStep("processing")

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Create payment intent
      const paymentResult = await createPaymentIntent(amount, paymentId, type)

      if (paymentResult.error) {
        throw new Error(paymentResult.error)
      }

      // Confirm payment based on type
      let confirmResult
      if (type === "appointment") {
        confirmResult = await confirmAppointmentPayment(paymentId)
      } else {
        confirmResult = await confirmLabTestPayment(paymentId)
      }

      if (confirmResult.error) {
        throw new Error(confirmResult.error)
      }

      setPaymentStep("success")
      toast.success("Payment successful!")

      // Redirect to success page after a short delay
      setTimeout(() => {
        router.push(`/payment/success?paymentId=${paymentId}&type=${type}`)
      }, 2000)
    } catch (error) {
      console.error("Payment error:", error)
      toast.error(error instanceof Error ? error.message : "Payment failed. Please try again.")
      setPaymentStep("form")
    } finally {
      setIsProcessing(false)
    }
  }

  if (paymentStep === "processing") {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
        <p className="text-gray-600">Please wait while we process your payment securely...</p>
        <div className="mt-6 bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-orange-700">
            <Lock className="h-4 w-4 inline mr-1" />
            Your payment is being processed securely
          </p>
        </div>
      </div>
    )
  }

  if (paymentStep === "success") {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600">Redirecting you to confirmation page...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-orange-500" />
          Card Information
        </h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="cardNumber" className="text-gray-700">
              Card Number
            </Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange("cardNumber", e.target.value)}
              className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
              maxLength={19}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate" className="text-gray-700">
                Expiry Date
              </Label>
              <Input
                id="expiryDate"
                type="text"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                maxLength={5}
                required
              />
            </div>

            <div>
              <Label htmlFor="cvv" className="text-gray-700">
                CVV
              </Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={formData.cvv}
                onChange={(e) => handleInputChange("cvv", e.target.value)}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                maxLength={4}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cardholderName" className="text-gray-700">
              Cardholder Name
            </Label>
            <Input
              id="cardholderName"
              type="text"
              placeholder="John Doe"
              value={formData.cardholderName}
              onChange={(e) => handleInputChange("cardholderName", e.target.value)}
              className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
              required
            />
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-orange-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700">Amount to be charged:</span>
          <span className="text-xl font-bold text-orange-600">Rs. {(amount)}</span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-lg font-semibold shadow-lg"
      >
        {isProcessing ? (
          <div className="flex items-center">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Lock className="h-5 w-5 mr-2" />
            Pay Rs. {(amount)} Securely
          </div>
        )}
      </Button>

      {/* Security Notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          <Lock className="h-3 w-3 inline mr-1" />
          Your payment information is encrypted and secure
        </p>
      </div>
    </form>
  )
}
