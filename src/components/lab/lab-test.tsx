"use client";

import { useForm } from "react-hook-form";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { AppointmentSchema, LabTestSchema } from "@/src/schemas";
import { useEffect, useState, useTransition } from "react";
import { appointment } from "@/actions/appointment";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { TimePicker } from "../time-picker";
import { currentUserId } from "@/src/lib/auth";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllDoctors } from "@/actions/all-doctors";
import { Textarea } from "@/components/ui/textarea";
import { bookLabTest } from "@/actions/lab";

export const LabForm = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string | undefined>("");

  const [isPending, startTransition] = useTransition();

  const onSubmit = (values: z.infer<typeof LabTestSchema>) => {
    console.log(values)
    bookLabTest(values).then((response) => {
      console.log(response)
      if (response.error) {
        toast.error(response.error)
      } else {
        toast.success(response.success)
        if (response.redirectToPayment && response.paymentId) {
          // Redirect to payment page
          setTimeout(() => {
            window.location.href = `/payment?paymentId=${response.paymentId}&type=labtest`
          }, 1000)
        }
      }
    })
  }

  const form = useForm<z.infer<typeof LabTestSchema>>({
    resolver: zodResolver(LabTestSchema),
    defaultValues: {
      contactInfo: "",
      address: "",
      testType: "BLOOD_TEST",
      customTestRequest: "",
      specialInstructions: "",
      userId: null,
      time: "",
      date: new Date(),
    },
  });

  return (
    <div className="flex justify-center items-center">
      <Card className="w-[600px] p-8 mb-20">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
          <h1 className="text-2xl mb-4 underline font-bold">Book a Lab Test</h1>
            {/* Contact Information Field */}
            <FormField
              control={form.control}
              name="contactInfo"
              render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel>Contact</FormLabel>
                  <FormControl>
                    <PhoneInput
                      {...field}
                      disabled={isPending}
                      placeholder="Enter phone number"
                      defaultCountry="PK"
                      international
                      withCountryCallingCode
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel>Pick a time</FormLabel>
                  <FormControl>
                    <TimePicker disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col mb-2">
                  <FormLabel>Date of Appointment</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal ",
                            !field.value && "text-muted-foreground "
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-100" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        className="bg-white font-semibold"
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Address Field */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="Enter your address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Test Type Selector */}
            <FormField
              control={form.control}
              name="testType"
              render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel>Type of Test</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a Test Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup className="bg-white">
                          <SelectLabel>Test Types</SelectLabel>
                          <SelectItem value="BLOOD_TEST">Blood Test</SelectItem>
                          <SelectItem value="URINE_TEST">Urine Test</SelectItem>
                          <SelectItem value="STOOL_TEST">Stool Test</SelectItem>
                          <SelectItem value="COVID_TEST">COVID Test</SelectItem>
                          <SelectItem value="DIABETES_MONITORING">
                            Diabetes Monitoring
                          </SelectItem>
                          <SelectItem value="CHOLESTEROL_CHECK">
                            Cholesterol Check
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom Test Request Field */}
            <FormField
              control={form.control}
              name="customTestRequest"
              render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel>Custom Test Request</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isPending}
                      placeholder="Specify any custom test request"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Special Instructions Field */}
            <FormField
              control={form.control}
              name="specialInstructions"
              render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel>Special Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isPending}
                      placeholder="Enter any special instructions"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" className="mt-4 btn-primary bg-red-700">
              Submit
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};
