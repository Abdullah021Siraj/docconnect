"use client"

import { useState, useTransition } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { toast } from "sonner"

import { CreditCard, DollarSign, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { confirmAppointmentPayment, confirmLabTestPayment } from "@/actions/payment"

interface PaymentFormProps {
  paymentId: string
  amount: number
  type: "appointment" | "labtest"
  description: string
}

export const PaymentForm = ({ paymentId, amount, type, description }: PaymentFormProps) => {
  const [isPending, startTransition] = useTransition()
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card")
  const router = useRouter()

  const handlePayment = () => {
    startTransition(async () => {
      try {
        let result

        if (type === "appointment") {
          result = await confirmAppointmentPayment(paymentId)
        } else {
          result = await confirmLabTestPayment(paymentId)
        }

        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success(result.success)
          // Redirect to success page or dashboard
          setTimeout(() => {
            router.push("/user")
          }, 2000)
        }
      } catch (error) {
        toast.error("Payment failed. Please try again.")
      }
    })
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
                paymentMethod === "card" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setPaymentMethod("card")}
            >
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-3" />
                <div>
                  <div className="font-medium">Credit/Debit Card</div>
                  <div className="text-sm text-gray-500">Pay securely with your card</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handlePayment}
            disabled={isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
          >
            {isPending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Confirm Payment (${amount})
              </div>
            )}
          </Button>

          <Button variant="outline" onClick={() => router.back()} disabled={isPending} className="w-full">
            Cancel
          </Button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🔒 Your payment information is secure and encrypted</p>
        </div>
      </Card>
    </div>
  )
}
