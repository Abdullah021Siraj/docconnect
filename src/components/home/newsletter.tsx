"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

import { Subscribe } from "../../../actions/subscribe";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { subEmailSchema } from "@/src/schemas";

export const Newsletter = () => {
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof subEmailSchema>>({
    resolver: zodResolver(subEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof subEmailSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      Subscribe(values).then((data) => {
        if (data?.error) {
          setError(data.error);
          toast.error(data.error);
        }
        if (data?.success) {
          setSuccess(data.success);
          toast.success(data.success);
        }
      });
    });
  };

  return (
    <div className="flex justify-center items-center flex-col text-center gap-y-4 mt-20">
      <span className="text-[#FF685B] font-semibold">Newsletter</span>
      <h1 className="text-3xl font-bold">JOIN US</h1>
      <p className="text-muted-foreground">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. <br />{" "}
        Cupiditate laboriosam nobis nam quibusdam sed consequuntur veritatis
        eius delectus minus neque perferendis.
      </p>
      <div className="mt-10">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col space-x-2 items-center sm:flex-row "
          >
            <div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Your Email"
                        type="email"
                        className="w-[350px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* <FormError message={error} /> */}
            {/* <FormSuccess message={success} /> */}
            <div className="sm:mt-0 mt-4">
              <Button
                disabled={isPending}
                type="submit"
                className="bg-[#FF685B] text-white "
              >
                Subscribe
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <div className="mb-20"></div>
    </div>
  );
};
