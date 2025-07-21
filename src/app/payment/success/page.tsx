import { db } from "@/src/lib/db"
import { currentUser } from "@/src/lib/auth"
import { redirect } from "next/navigation"
import { PaymentSuccess } from "@/src/components/payment-success"


interface PaymentSuccessPageProps {
  searchParams: Promise<{
    paymentId?: string
    type?: "appointment" | "labtest"
  }>
}

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const user = await currentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { paymentId, type } = searchParams

  if (!paymentId || !type) {
    redirect("/user")
  }

  let bookingData
  let roomId

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

    roomId = bookingData.roomId
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
  }

  return <PaymentSuccess type={type} bookingDetails={bookingData} roomId={roomId ?? undefined} />
}
