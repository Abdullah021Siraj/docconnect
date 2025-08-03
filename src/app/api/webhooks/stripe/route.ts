import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeSecretKey || !endpointSecret) {
    console.warn("⚠️ Stripe env vars are missing. Skipping webhook.")
    return NextResponse.json({ error: "Stripe configuration missing" }, { status: 500 })
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-04-30.basil",
  })

  const body = await req.text()
  const sig = headers().get("stripe-signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.log(`Webhook signature verification failed.`, err.message)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log("Payment succeeded:", paymentIntent.id)
      break

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object as Stripe.PaymentIntent
      console.log("Payment failed:", failedPayment.id)
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
