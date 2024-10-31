import * as z from "zod";
import { UserRole } from "@prisma/client";

const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /[0-9]/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

// Custom password validator
const passwordValidator = z
  .string()
  .min(6, { message: "Password must be at least 6 characters long" })
  .regex(UPPERCASE_REGEX, {
    message: "Password must contain at least one uppercase letter",
  })
  .regex(LOWERCASE_REGEX, {
    message: "Password must contain at least one lowercase letter",
  })
  .regex(NUMBER_REGEX, {
    message: "Password must contain at least one number",
  })
  .regex(SPECIAL_CHAR_REGEX, {
    message: "Password must contain at least one special character",
  });

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Minimum 2 character are required" }),
  code: z.optional(z.string()),
});
export { LoginSchema };

const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});
export { ResetSchema };

const NewPasswordSchema = z.object({
  password: passwordValidator,
});
export { NewPasswordSchema };

const RegisterSchema = z.object({
  email: z.string().email(),
  password: passwordValidator,
  name: z.string().min(2, { message: "Minimum 2 characters are required" }),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export { RegisterSchema };

const SettingSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    email: z.optional(z.string().email()),
    password: z.optional(
      z.string().min(6, { message: "Password is required and must be at least 6 characters." })
    ),
    newPassword: z.optional(passwordValidator),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }
      return true;
    },
    {
      message: "New Password is required when updating Password.",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.password && data.newPassword && data.password === data.newPassword) {
        return false;
      }
      return true;
    },
    {
      message: "New Password cannot be the same as the current Password.",
      path: ["newPassword"],
    }
  );

export { SettingSchema };
