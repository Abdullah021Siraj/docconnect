"use server";

import * as z from "zod";
import { AuthError } from "next-auth";

import { getUserByEmail } from "../data/user";
import { getTwoFactorTokenByEmail } from "../data/two-factor-token";
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "./email";
import { DEFAULT_ADMIN_REDIRECT, DEFAULT_LOGIN_REDIRECT } from "../routes";

import { getTwoFactorConfirmationByUserId } from "../data/two-factor-confirmation";
import bcrypt from "bcryptjs";
import { LoginSchema } from "@/src/schemas";
import { generateTwoFactorToken, generateVerificationToken } from "@/src/lib/tokens";
import { db } from "@/src/lib/db";
import { logUserActivity } from "@/src/lib/notification";
import { signIn } from "@/src/auth";



export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null,
) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist!" };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );
    return { success: "Confirmation email Sent!" };
  }

  const passwordMatch = await bcrypt.compare(password, existingUser.password);

  if (!passwordMatch) {
    return { error: "Invalid Credentials!" };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) {
        return { error: "Invalid code!" };
      }

      if (twoFactorToken.token !== code) {
        return { error: "Invalid code!" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: "Code expired!" };
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      );

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true};
    }
  }

  try {
    const redirectUrl = existingUser.role === "ADMIN" 
      ? DEFAULT_ADMIN_REDIRECT
      : callbackUrl || DEFAULT_LOGIN_REDIRECT ;
    await logUserActivity(existingUser.id, "LOGIN", "User logged in successfully.");
      await signIn("credentials", {
      email,
      password,
      redirectTo: redirectUrl,
    });
    return { success: "Login Sucess!" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    throw error;
  }
};