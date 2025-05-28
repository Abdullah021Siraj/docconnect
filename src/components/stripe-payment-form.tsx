"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { toast } from "sonner"
import { createPaymentIntent, confirmAppointmentPayment, confirmLabTestPayment } from "@/actions/payment"
import { CreditCard, DollarSign, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripePaymentFormProps {
  paymentId: string
  amount: number
  type: "appointment" | "labtest"
  description: string
}

const CheckoutForm = ({ paymentId, amount, type, description }: StripePaymentFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cash">("stripe")

  useEffect(() => {
    // Create payment intent when component mounts
    const initializePayment = async () => {
      const result = await createPaymentIntent(amount, paymentId, type)
      if (result.success && result.clientSecret) {
        setClientSecret(result.clientSecret)
      } else {
        toast.error(result.error || "Failed to initialize payment")
      }
    }

    if (paymentMethod === "stripe") {
      initializePayment()
    }
  }, [amount, paymentId, type, paymentMethod])

  const handleStripePayment = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      toast.error("Stripe is not ready. Please try again.")
      return
    }

    setIsLoading(true)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      toast.error("Card element not found")
      setIsLoading(false)
      return
    }

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    })

    if (error) {
      toast.error(error.message || "Payment failed")
      setIsLoading(false)
    } else if (paymentIntent.status === "succeeded") {
      // Payment successful, confirm in our database
      let result
      if (type === "appointment") {
        result = await confirmAppointmentPayment(paymentId)
      } else {
        result = await confirmLabTestPayment(paymentId)
      }

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Payment successful!")
        router.push(`/payment/success?paymentId=${paymentId}&type=${type}`)
      }
      setIsLoading(false)
    }
  }

  const handleCashPayment = async () => {
    setIsLoading(true)

    let result
    if (type === "appointment") {
      result = await confirmAppointmentPayment(paymentId)
    } else {
      result = await confirmLabTestPayment(paymentId)
    }

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Booking confirmed! Please pay in cash at the facility.")
      router.push(`/payment/success?paymentId=${paymentId}&type=${type}`)
    }
    setIsLoading(false)
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-[500px] p-8 border-2 border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total Amount:</span>
            <span className="text-2xl font-bold text-green-600">Rs. {amount}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">Payment ID: {paymentId}</div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Select Payment Method</h3>
          <div className="space-y-3">
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === "stripe" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setPaymentMethod("stripe")}
            >
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-3" />
                <div>
                  <div className="font-medium">Credit/Debit Card</div>
                  <div className="text-sm text-gray-500">Pay securely with Stripe</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {paymentMethod === "stripe" ? (
          <form onSubmit={handleStripePayment} className="space-y-4">
            <div className="p-4 border rounded-lg">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      "::placeholder": {
                        color: "#aab7c4",
                      },
                    },
                  },
                }}
              />
            </div>

            <Button
              type="submit"
              disabled={!stripe || isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Pay ${amount}
                </div>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Cash Payment Selected</p>
                  <p className="text-yellow-700 mt-1">
                    Your booking will be confirmed. Please bring ${amount} in cash to your appointment.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCashPayment}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirming Booking...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Confirm Cash Payment
                </div>
              )}
            </Button>
          </div>
        )}

        <Button variant="outline" onClick={() => router.back()} disabled={isLoading} className="w-full mt-4">
          Cancel
        </Button>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🔒 Your payment information is secure and encrypted</p>
        </div>
      </Card>
    </div>
  )
}

export const StripePaymentForm = (props: StripePaymentFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
}
