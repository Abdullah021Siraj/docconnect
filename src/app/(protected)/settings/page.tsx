"use client"

import type * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { settings } from "../../../../actions/settings"
import { Card, CardContent, CardHeader, CardDescription } from "@/src/components/ui/card"
import { FormError } from "@/src/components/form-error"
import { FormSuccess } from "@/src/components/form-success"
import { Switch } from "@/src/components/ui/switch"
import { SettingSchema } from "@/src/schemas"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { useCurrentUser } from "../../../../hooks/use-current-user"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  KeyRound,
  Shield,
  Mail,
  Eye,
  EyeOff,
  Save,
  UserCircle,
  Bell,
  ArrowLeft,
  Home,
  SettingsIcon,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"

type UserRole = "ADMIN" | "USER" | "DOCTOR"

type AppUser = {
  id: string
  role: UserRole
  isOAuth: boolean
  name?: string
  email?: string
  isTwoFactorEnabled?: boolean
  image?: string
}

const SettingsPage = () => {
  const user = useCurrentUser() as AppUser | undefined
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()
  const { update } = useSession()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof SettingSchema>>({
    resolver: zodResolver(SettingSchema),
    defaultValues: {
      password: "",
      newPassword: "",
      name: user?.name || undefined,
      email: user?.email || undefined,
      isTwoFactorEnabled: user?.isTwoFactorEnabled ?? false,
    },
  })

  const onSubmit = (values: z.infer<typeof SettingSchema>) => {
    setError(undefined)
    setSuccess(undefined)

    startTransition(() => {
      settings(values)
        .then((data) => {
          if (data.error) {
            setError(data.error)
          }

          if (data.success) {
            update()
            setSuccess(data.success)
          }
        })
        .catch(() => setError("Something went wrong!"))
    })
  }

  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleGoHome = () => {
    // Determine home route based on user role
    if (user?.role === "ADMIN") {
      router.push("/admin")
    } else if (user?.role === "DOCTOR") {
      router.push("/doctor")
    } else {
      router.push("/dashboard")
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-[#FF685B]/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header with Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoBack}
                className="flex items-center gap-2 hover:bg-[#FF685B]/10 border-[#FF685B]/20"
              >
                <ArrowLeft size={16} />
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoHome}
                className="flex items-center gap-2 hover:bg-[#FF685B]/10 border-[#FF685B]/20"
              >
                <Home size={16} />
                Home
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#FF685B]/10 p-2 rounded-full">
                <SettingsIcon size={20} className="text-[#FF685B]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FF685B] to-[#FF8A7A] bg-clip-text text-transparent">
                  Account Settings
                </h1>
                <p className="text-sm text-muted-foreground">Manage your account preferences and security</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* User Profile Summary */}
          <div className="w-full lg:w-1/3">
            <Card className="shadow-lg border-neutral-200 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4 ring-4 ring-[#FF685B]/20">
                    <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-[#FF685B] to-[#FF8A7A] text-white text-xl">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold">{user?.name || "User"}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">
                      {user?.role || "USER"}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FF685B]/5">
                    <div className="bg-[#FF685B]/10 p-2 rounded-full">
                      <UserCircle size={18} className="text-[#FF685B]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Account Type</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.isOAuth ? "OAuth Account" : "Email & Password"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FF685B]/5">
                    <div className="bg-[#FF685B]/10 p-2 rounded-full">
                      <Shield size={18} className="text-[#FF685B]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Two-Factor Auth</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.isTwoFactorEnabled ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Form */}
          <div className="w-full lg:w-2/3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/80 backdrop-blur-sm">
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2 data-[state=active]:bg-[#FF685B] data-[state=active]:text-white"
                >
                  <UserCircle size={16} />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex items-center gap-2 data-[state=active]:bg-[#FF685B] data-[state=active]:text-white"
                >
                  <KeyRound size={16} />
                  <span>Security</span>
                </TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <TabsContent value="profile">
                    <Card className="shadow-lg border-neutral-200 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <UserCircle size={20} className="text-[#FF685B]" />
                          Profile Information
                        </h3>
                        <CardDescription>Update your personal information and preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <UserCircle size={16} className="text-[#FF685B]" />
                                Display Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="John Doe"
                                  disabled={isPending}
                                  className="focus-visible:ring-[#FF685B] bg-white/50"
                                />
                              </FormControl>
                              <FormDescription>This is the name that will be displayed to other users.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {user && !user.isOAuth && (
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Mail size={16} className="text-[#FF685B]" />
                                  Email Address
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="john.doe@example.com"
                                    type="email"
                                    disabled={isPending}
                                    className="focus-visible:ring-[#FF685B] bg-white/50"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Your email address is used for notifications and sign-in.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="security">
                    <Card className="shadow-lg border-neutral-200 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Shield size={20} className="text-[#FF685B]" />
                          Security Settings
                        </h3>
                        <CardDescription>Manage your password and security preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {user && !user.isOAuth && (
                          <>
                            <FormField
                              control={form.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <KeyRound size={16} className="text-[#FF685B]" />
                                    Current Password
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        placeholder="••••••••"
                                        type={showOldPassword ? "text" : "password"}
                                        disabled={isPending}
                                        className="pr-10 focus-visible:ring-[#FF685B] bg-white/50"
                                      />
                                      <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#FF685B] transition-colors"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                      >
                                        {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                      </button>
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    Enter your current password to verify your identity.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="newPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <KeyRound size={16} className="text-[#FF685B]" />
                                    New Password
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        placeholder="••••••••"
                                        type={showPassword ? "text" : "password"}
                                        disabled={isPending}
                                        className="pr-10 focus-visible:ring-[#FF685B] bg-white/50"
                                      />
                                      <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#FF685B] transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                      >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                      </button>
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    Choose a strong password with at least 8 characters.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="isTwoFactorEnabled"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-white/50">
                                  <div className="space-y-0.5">
                                    <FormLabel className="flex items-center gap-2">
                                      <Shield size={16} className="text-[#FF685B]" />
                                      Two Factor Authentication
                                    </FormLabel>
                                    <FormDescription>Add an extra layer of security to your account</FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      disabled={isPending}
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="data-[state=checked]:bg-[#FF685B]"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </>
                        )}

                        {user?.isOAuth && (
                          <div className="rounded-lg border p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                            <div className="flex items-start gap-3">
                              <div className="bg-amber-100 p-2 rounded-full mt-1">
                                <Bell size={16} className="text-amber-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-amber-800">OAuth Account</h4>
                                <p className="text-sm text-amber-700 mt-1">
                                  Your account uses OAuth for authentication. Password settings are managed by your
                                  OAuth provider.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <div className="mt-6 space-y-4">
                    <FormError message={error} />
                    <FormSuccess message={success} />

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        disabled={isPending}
                        type="submit"
                        className="flex-1 sm:flex-none bg-gradient-to-r from-[#FF685B] to-[#FF8A7A] hover:from-[#FF685B]/90 hover:to-[#FF8A7A]/90 shadow-lg"
                      >
                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            <span>Saving...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Save size={16} />
                            <span>Save Changes</span>
                          </div>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoHome}
                        className="flex-1 sm:flex-none border-[#FF685B]/20 hover:bg-[#FF685B]/10"
                      >
                        <Home size={16} className="mr-2" />
                        Go to Dashboard
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
