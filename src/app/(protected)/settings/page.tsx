"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { useSession } from "next-auth/react";
import { settings } from "../../../../actions/settings";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { FormError } from "@/src/components/form-error";
import { FormSuccess } from "@/src/components/form-success";
import { Switch } from "@/src/components/ui/switch";
import { SettingSchema } from "@/src/schemas";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { UserInfo } from "@/src/components/user-info";
import { useCurrentUser } from "../../../../hooks/use-current-user";

type User = {
  isOAuth: boolean;
  name?: string;
  email?: string;
  isTwoFactorEnabled?: boolean;
};

const SettingsPage = () => {
  const user = useCurrentUser() as User | undefined;

  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SettingSchema>>({
    resolver: zodResolver(SettingSchema),
    defaultValues: {
      password: "",
      newPassword: "",
      name: user?.name || undefined,
      email: user?.email || undefined,
      isTwoFactorEnabled: user?.isTwoFactorEnabled ?? false,
    },
  });

  const onSubmit = (values: z.infer<typeof SettingSchema>) => {
    startTransition(() => {
      settings(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }

          if (data.success) {
            update();
            setSuccess(data.success);
          }
        })
        .catch(() => setError("Something went wrong!"));
    });
  };

  return (
    <>
    
    <Card className="w-[600px] -mt-20">
    <UserInfo label="User Information" user={user} />
      <CardHeader>
        <p className="text-2xl font-semibold text-center">⚙️ Settings</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
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
                        placeholder="John Doe"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {user && !user.isOAuth && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="john.doe@example.com"
                            type="email"
                            disabled={isPending}
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
                            placeholder="******"
                            type={showOldPassword ? "text" : "password"}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                        <button
                          type="button"
                          className="flex text-xs hover:underline"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                        >
                          {showOldPassword ? "Hide password" : "Show password"}
                        </button>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="******"
                            type={showPassword ? "text" : "password"}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                        <button
                          type="button"
                          className="flex text-xs hover:underline"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "Hide password" : "Show password"}
                        </button>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isTwoFactorEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Two Factor Authentication</FormLabel>
                          <FormDescription>
                            Enable two factor authentication for your account
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            disabled={isPending}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button disabled={isPending} type="submit">
              Save
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
    </>
  );
};

export default SettingsPage;
