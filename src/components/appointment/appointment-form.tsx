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
import { AppointmentSchema } from "@/src/schemas";
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
export const AppointmentForm = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string | undefined>("");

  const [isPending, startTransition] = useTransition();

  const onSubmit = (values: z.infer<typeof AppointmentSchema>) => {
    // console.log(values);
    appointment(values).then((response) => {
      console.log(response); // Log server response
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success(response.success);
      }
    });
    // startTransition(() => {
    //   appointment(values).then((data) => {
    //     if (data?.error) {
    //       toast.error("Error");
    //     } else {
    //       toast.success("Success");
    //     }
    //   });
    // });
  };

  const form = useForm<z.infer<typeof AppointmentSchema>>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      name: "",
      reason: "",
      contact: "",
      date: new Date(),
      time: "",
      userId: "",
      doctor: "",
    },
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getAllDoctors();
        setDoctors(data);
      } catch (error) {
        console.error("Failed to fetch doctors", error);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="flex justify-center items-center">
      <Card className="w-[600px] p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="doctor"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className="bg-white">
                      <SelectLabel>Doctors</SelectLabel>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.speciality}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="John Doe"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
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
              name="reason"
              render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel>Reason for Appointment</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      className=" p-4"
                      placeholder="e.x Headache, Fever and etc"
                      {...field}
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

            <Button type="submit" className="mt-4 btn-primary">
              Submit
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};
