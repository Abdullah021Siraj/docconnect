
import { db } from "@/src/lib/db"
import { currentUser } from "@/src/lib/auth"
import { redirect } from "next/navigation"
import { StripePaymentForm } from "@/src/components/stripe-payment-form"

interface PaymentPageProps {
  searchParams: {
    paymentId?: string
    type?: "appointment" | "labtest"
  }
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const user = await currentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { paymentId, type } = searchParams

  if (!paymentId || !type) {
    redirect("/user")
  }

  let bookingData
  let amount
  let description

  if (type === "appointment") {
    bookingData = await db.appointment.findUnique({
      where: { paymentId },
      include: {
        doctor: true,
        user: true,
      },
    })

    if (!bookingData || bookingData.userId !== user.id) {
      redirect("/user")
    }

    if (bookingData.status === "CONFIRMED") {
      redirect(`/payment/success?paymentId=${paymentId}&type=${type}`)
    }

    amount = 3000 // Default appointment fee
    description = `Appointment with ${bookingData.doctor?.name} on ${bookingData.startTime.toLocaleDateString()}`
  } else {
    bookingData = await db.labTest.findUnique({
      where: { paymentId },
      include: {
        User: true,
      },
    })

    if (!bookingData || bookingData.userId !== user.id) {
      redirect("/user")
    }

    if (bookingData.status === "CONFIRMED") {
      redirect(`/payment/success?paymentId=${paymentId}&type=${type}`)
    }

    amount = 4500 // Default lab test fee
    description = `${bookingData.testType.replace("_", " ")} test on ${bookingData.testStartTime.toLocaleDateString()}`
  }

  return <StripePaymentForm paymentId={paymentId} amount={amount} type={type} description={description} />
}
