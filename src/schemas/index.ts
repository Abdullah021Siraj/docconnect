import * as z from "zod";
import { UserRole } from "@prisma/client";

// Custom password validation regex patterns
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /[0-9]/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

// Common password list (should be expanded in production)
const COMMON_PASSWORDS = [
  "password123",
  "12345678",
  "qwerty123",
  "admin123",
  "letmein",
];

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
  })
  .refine((password) => !COMMON_PASSWORDS.includes(password.toLowerCase()), {
    message: "Password is too common. Please choose a stronger password",
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
  // password: z.string().min(6, {
  //   message: "Minimum 6 characters are required",
  // }),
  password: passwordValidator,
});
export { NewPasswordSchema };

const RegisterSchema = z.object({
  email: z.string().email(),
  // password: z.string().min(6, { message: "Minimum 6 characters are required" }),
  password: passwordValidator,
  name: z.string().min(2, { message: "Minimum 2 characters are required" }),
});

export { RegisterSchema };

const SettingSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.optional(z.string().email()),
    // password: z.optional(z.string().min(6)),
    // newPassword: z.optional(z.string().min(6)),
    password: z.optional(z.string().min(6, {message: "Password is required"})),
    newPassword: z.optional(passwordValidator),
  })
  /*This validation ensures that if a password is provided, a newPassword must also be provided.*/
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }
      return true;
    },
    {
      message: "New Password is Required!",
      path: ["newPassword"],
    }
  )
  /*This validation seems intended to check that if a newPassword is provided, a password must also be provided.*/
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
      message: "Password is Required!",
      path: ["password"],
    }
  );
export { SettingSchema };