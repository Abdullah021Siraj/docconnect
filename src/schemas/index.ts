import { parsePhoneNumber } from 'libphonenumber-js';
import * as z from "zod";

const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /[0-9]/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[A-Za-z\s]+$/;

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
  email: z.string().email().regex(EMAIL_REGEX, { message: "Invalid email" }),
  password: passwordValidator,
  name: z
    .string()
    .min(2, { message: "Minimum 2 characters are required" })
    .regex(NAME_REGEX, {
      message: "Name must only contain alphabets",
    }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export { RegisterSchema };

const subEmailSchema = z.object({
  email: z.string().email(),
});

export { subEmailSchema };

export const SettingSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    email: z.optional(z.string().email()),
    password: z.optional(
      z
        .string()
        .min(6, {
          message: "Password is required and must be at least 6 characters.",
        })
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
      if (
        data.password &&
        data.newPassword &&
        data.password === data.newPassword
      ) {
        return false;
      }
      return true;
    },
    {
      message: "New Password cannot be the same as the current Password.",
      path: ["newPassword"],
    }
  );

const AppointmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  reason: z.string().max(500, "Reason must be at most 500 characters"),
  contact: z.string().refine((value) => {
    try {
      const phoneNumber = parsePhoneNumber(value, 'PK');
      return phoneNumber.isValid();
    } catch {
      return false;
    }
  }, {
    message: "Invalid phone number",
  }),
  date: z.coerce.date(),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (must be HH:mm)"),
  userId: z.string().optional(),
  doctor: z.string().optional()
});

export { AppointmentSchema };

export const LabTestSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional().nullable(), 
  contactInfo: z.string().refine((value) => {
    try {
      const phoneNumber = parsePhoneNumber(value, 'PK');
      return phoneNumber.isValid();
    } catch {
      return false;
    }
  }, {
    message: "Invalid phone number",
  }),
  address: z.string().min(1, "Address is required"),
  testType: z.enum([
    "BLOOD_TEST",
    "URINE_TEST",
    "STOOL_TEST",
    "COVID_TEST",
    "DIABETES_MONITORING",
    "CHOLESTEROL_CHECK",
  ]),
  customTestRequest: z.string().optional().nullable(),
  specialInstructions: z.string().optional().nullable(),
  createdAt: z.date().optional(), 
  updatedAt: z.date().optional(), 
   time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (must be HH:mm)"),
   date: z.coerce.date(),
});
