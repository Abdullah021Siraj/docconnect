"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@/src/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { CardWrapper } from "@/src/components/auth/card-wrapper";
import { FormError } from "@/src/components/form-error";
import { FormSuccess } from "@/src/components/form-success";
import { register } from "../../../actions/register";
import Link from "next/link";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { toast } from "sonner";

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      termsAccepted: false,
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      register(values).then((data) => {
        setError(data.error);
        toast.error("Error");
        setSuccess(data.success);
        toast.success("Success");
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Create an account"
      backButtonLabel="Already have an account?"
      backButtonHref="/auth/login"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="John Doe"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="john.doe@example.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="******"
                      type={showPassword ? "text" : "password"}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="flex text-xs hover:underline "
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide password" : "Show password"}
                  </button>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms & Conditions</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="termsAccepted"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="form-checkbox"
                      />
                      <FormLabel htmlFor="termsAccepted" className="text-sm">
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          target="_blank"
                          className="underline text-blue-600"
                        >
                          Terms and Conditions
                        </Link>
                      </FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button disabled={isPending} type="submit" className="w-full">
            Create an account
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
