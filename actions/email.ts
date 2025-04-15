"use server";

import { info, transporter } from "../src/lib/mail";

const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const confirmLink = `${domain}/auth/new-verification?token=${token}`;
    const mail = await transporter.sendMail({
      ...info,
      to: email,
      subject: "Verify Your Email Address and Unlock Your Account",
      html: `
      <h2>Email Verification</h2>
      <p>Hi there!</p>
      <p>We're excited to have you on board! To complete your account setup, please verify your email address by clicking the link below:</p>
      <p><a href="${confirmLink}" style="background-color: #007bff; color: #ffffff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Verify Email</a></p>
      <p>If you have any issues, feel free to reply to this email or contact our support team.</p>
      <p>Best regards,</p>
      <p>Team</p>
    `,
    });
  } catch (error: any) {
    return JSON.parse(
      JSON.stringify({
        success: "Error",
        status: 500,
        error: error.toString(),
      })
    );
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  const mail = await transporter.sendMail({
    ...info,
    to: email,
    subject: "Reset Your Password and Get Back to Your Account",
    html: `
      <h2>Password Reset Request</h2>
      <p>Hi there!</p>
      <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
      <p>To reset your password, click the link below:</p>
      <p><a href="${resetLink}" style="background-color: #007bff; color: #ffffff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Reset Password</a></p>
      <p>If you have any issues, feel free to reply to this email or contact our support team.</p>
      <p>Best regards,</p>
      <p>Team</p>
    `,
  });
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const mail = await transporter.sendMail({
    ...info,
    to: email,
    subject: "Your 2FA Code for Secure Login",
    html: `
      <h2>2-Factor Authentication Code</h2>
      <p>Hi there!</p>
      <p>To complete your login, please enter the 2FA code below:</p>
      <p style="font-size: 20px; font-weight: bold;">${token}</p>
      <p>If you have any issues, feel free to reply to this email or contact our support team.</p>
      <p>Best regards,</p>
      <p>Team</p>
    `,
  });
};

export const appointmentBooking = async (
  email: string,
  roomId: string,
  date: Date
) => {
  const meetingLink = `${process.env.NEXT_PUBLIC_APP_URL}/room/${roomId}`;

  const mail = await transporter.sendMail({
    ...info,
    to: email,
    subject: "DocConnect Appointment Scheduled – Here's What to Know",
    html: `
      <h2 style="font-family: Arial, sans-serif; color: #333;">Appointment Confirmation</h2>

<p style="font-family: Arial, sans-serif; color: #555;">Dear Patient,</p>

<p style="font-family: Arial, sans-serif; color: #555;">
  We are pleased to confirm that your appointment has been successfully booked.
</p>

<p style="font-family: Arial, sans-serif; color: #555;">
  <strong>Date & Time:</strong> ${new Date(date).toLocaleString()}
</p>

<p style="font-family: Arial, sans-serif; color: #555;">
  You can join your appointment using the link below:
</p>

<p style="font-family: Arial, sans-serif;">
  <a href="${meetingLink}" style="font-size: 18px; font-weight: bold; color: #007bff;">
    Join Appointment Room
  </a>
</p>

<p style="font-family: Arial, sans-serif; color: #555;">
  Please ensure that you join the appointment at the scheduled time. We recommend logging in a few minutes early to avoid any delays.
</p>

<p style="font-family: Arial, sans-serif; color: #555;">
  <strong>Note:</strong> If you are unable to attend the appointment, please notify us in advance so we can make necessary arrangements. Failure to join without prior notice may result in the appointment being rescheduled.
</p>

<p style="font-family: Arial, sans-serif; color: #555;">
  <strong>Follow-Up:</strong> After your appointment, a follow-up email may be sent to gather your feedback or schedule any further consultations if needed.
</p>

<p style="font-family: Arial, sans-serif; color: #555;">
  If you have any questions or require assistance, feel free to reply to this email or contact our support team.
</p>

<br />

<p style="font-family: Arial, sans-serif; color: #555;">Best regards,</p>
<p style="font-family: Arial, sans-serif; color: #555;">DocConnect Team</p>

    `,
  });

  return mail;
};

export const appointmentBookingDoctor = async (
  email: string,
  roomId: string,
  date: Date
) => {
  const meetingLink = `${process.env.NEXT_PUBLIC_APP_URL}/room/${roomId}`;

  const mail = await transporter.sendMail({
    ...info,
    to: email,
    subject: "New Appointment Scheduled via DocConnect",
    html: `
      <h2 style="font-family: Arial, sans-serif; color: #333;">New Appointment Scheduled</h2>

<p style="font-family: Arial, sans-serif; color: #555;">Hello,</p>

<p style="font-family: Arial, sans-serif; color: #555;">
  An upcoming appointment has been successfully booked through <strong>DocConnect</strong>.
</p>

<p style="font-family: Arial, sans-serif; color: #555;">
  <strong>Date & Time:</strong> ${new Date(date).toLocaleString()}
</p>

<p style="font-family: Arial, sans-serif; color: #555;">
  You can join the session using the link below:
</p>

<p style="font-family: Arial, sans-serif;">
  <a href="${meetingLink}" style="font-size: 18px; font-weight: bold; color: #007bff;">
    Join Appointment Room
  </a>
</p>

<p style="font-family: Arial, sans-serif; color: #555;">
  Please ensure you are available and logged in on time to conduct the consultation.
</p>

<p style="font-family: Arial, sans-serif; color: #555;">
  For any updates or changes, please reach out to the support team or reply to this email.
</p>

<br />

<p style="font-family: Arial, sans-serif; color: #555;">Best regards,</p>
<p style="font-family: Arial, sans-serif; color: #555;">DocConnect Team</p>

    `,
  });

  return mail;
};

export const sendEmail = async (
  receiverEmail: string,
  message: string,
  subject: string
) => {
  try {
    const mail = await transporter.sendMail({
      ...info,
      to: receiverEmail,
      subject: subject,
      // text: message,
      html: message,
    });

    return JSON.parse(JSON.stringify(mail.messageId));
  } catch (error: any) {
    return JSON.parse(
      JSON.stringify({
        success: "Error",
        status: 500,
        error: error.toString(),
      })
    );
  }
};
