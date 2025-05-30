"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Home,
  MessageSquare,
  Activity,
  Heart,
  Brain,
  Pill,
  Phone,
  Download,
  Plus,
  Bell,
  Settings,
  User,
  Stethoscope,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  Send,
  Moon,
  Sun,
  FileText,
  Video,
  TestTube,
  Menu,
  X,
  ChevronRight,
  Coffee,
  Apple,
  Move,
} from "lucide-react";
import jsPDF from "jspdf";
import { ModeToggle } from "../mode-toggle";
import { UserButton } from "../auth/user-button";
import Link from "next/link";
import { NotificationButton } from "../auth/notification-button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSession } from "next-auth/react";
import { getUserAppointmentData } from "@/data/appointment-data";

const healthTips = [
  {
    id: "tip-1",
    title: "Take Regular Breaks",
    description:
      "Step away from your screen every hour to avoid eye strain and mental fatigue.",
    category: "General",
    icon: <Coffee className="h-5 w-5" />,
  },
  {
    id: "tip-2",
    title: "Eat Colorful Meals",
    description:
      "Fruits and vegetables of different colors offer a range of essential nutrients.",
    category: "Nutrition",
    icon: <Apple className="h-5 w-5" />,
  },
  {
    id: "tip-3",
    title: "Stretch Often",
    description:
      "Incorporate light stretches into your routine to improve flexibility and circulation.",
    category: "Exercise",
    icon: <Move className="h-5 w-5" />,
  },
];

type HealthTip = {
  title: string;
  description: string;
  category: "Nutrition" | "Exercise" | "Mental" | "General";
  icon: React.ReactNode;
};

interface Appointment {
  id: string;
  patientName: string;
  startTime: string;
  status: "CONFIRMED" | "CANCELLED" | "PENDING";
  doctor?: {
    name: string;
    speciality: string;
  };
  roomId?: string;
}

interface Message {
  id: number;
  text: string;
  sender: "you" | "other";
  timestamp: Date;
}

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  icon: React.ReactNode;
}

const CustomSidebar = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const menuItems = [
    { id: "dashboard", title: "Dashboard", icon: Home },
    { id: "appointments", title: "Appointments", icon: Calendar },
    { id: "chatbot", title: "Disease Prediction", icon: MessageSquare },
    { id: "emergency", title: "Emergency", icon: Phone },
  ];

  const user = useCurrentUser();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
    fixed top-0 left-0 w-64 h-screen
    bg-gradient-to-b from-white to-[#FF685B]/10 dark:from-gray-900 dark:to-gray-800
    border-r border-[#FF685B]/20 dark:border-gray-700
    z-50 transform transition-transform duration-300 ease-in-out
    flex flex-col
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0 lg:static lg:z-auto
  `}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#FF685B]/20 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[#FF685B] to-[#FF8A7A] rounded-lg shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-[#FF685B] to-[#FF8A7A] bg-clip-text text-transparent">
                  HealthHub
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your Health Dashboard
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4 text-gray-700 dark:text-gray-200" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
              Navigation
            </p>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200
                  ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-[#FF685B] to-[#FF8A7A] text-white shadow-lg border-r-2 border-[#FF685B]"
                      : "text-gray-700 dark:text-gray-300 hover:bg-[#FF685B]/10 dark:hover:bg-[#FF685B]/20 hover:text-[#FF685B] dark:hover:text-[#FF8A7A]"
                  }
                `}
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.title}</span>
                {activeTab === item.id && (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#FF685B]/20 dark:border-gray-700">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#FF685B]/10 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg border border-[#FF685B]/20 dark:border-gray-700">
            <div className="p-2 bg-[#FF685B]/20 dark:bg-[#FF685B]/30 rounded-full">
              <User className="h-4 w-4 text-[#FF685B]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const HealthTipCard = ({ tip }: { tip: HealthTip }) => {
  const categoryColors: Record<string, string> = {
    Nutrition: "bg-green-100 text-green-700 dark:bg-green-900/20",
    Exercise: "bg-blue-100 text-blue-700 dark:bg-blue-900/20",
    Mental: "bg-purple-100 text-purple-700 dark:bg-purple-900/20",
    General: "bg-gray-100 text-gray-700 dark:bg-gray-800/50",
  };

  const categoryColor =
    categoryColors[tip.category] || categoryColors["General"];

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border border-[#FF685B]/20 bg-gradient-to-br from-white to-[#FF685B]/5 dark:from-gray-900 dark:to-gray-800">
      <CardContent className="p-6 flex items-start gap-4">
        {/* Icon */}
        <div className={`p-3 rounded-lg ${categoryColor}`}>{tip.icon}</div>

        {/* Text Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {tip.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {tip.description}
          </p>
        </div>

        {/* Optional Badge */}
        <Badge className="mt-1" variant="outline">
          {tip.category}
        </Badge>
      </CardContent>
    </Card>
  );
};

const ChatbotInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your health assistant. How can I help you today? You can ask me about symptoms, medications, or general health questions.",
      sender: "other",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "you",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response with more realistic responses
    setTimeout(() => {
      const responses = [
        "I understand your concern. Based on your symptoms, I recommend consulting with a healthcare professional. Would you like me to help you book an appointment?",
        "That's a great question! For symptoms like these, it's important to monitor them closely. Have you experienced this before?",
        "I can help you with that. Let me provide some general guidance, but please remember this doesn't replace professional medical advice.",
        "Based on what you've described, here are some general recommendations. However, I strongly suggest discussing this with your doctor.",
      ];

      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const botResponse: Message = {
        id: messages.length + 2,
        text: randomResponse,
        sender: "other",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const exportChatToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Health Chat History", 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

    let yPosition = 50;
    messages.forEach((message, index) => {
      doc.setFontSize(12);
      const sender = message.sender === "you" ? "You" : "Health Assistant";
      const lines = doc.splitTextToSize(`${sender}: ${message.text}`, 170);

      lines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 7;
      });
      yPosition += 5;
    });

    doc.save("health-chat-history.pdf");
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-[#FF685B]/20 shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-[#FF685B]/20 bg-gradient-to-r from-[#FF685B]/10 to-white rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-[#FF685B] to-[#FF8A7A] rounded-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Disease Prediction</h3>
            <p className="text-sm text-gray-500">AI-powered health guidance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportChatToPDF}
            className="flex items-center gap-2 border-[#FF685B]/30 text-[#FF685B] hover:bg-[#FF685B]/10"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDarkMode(!darkMode)}
            className="border-[#FF685B]/30 text-[#FF685B] hover:bg-[#FF685B]/10"
          >
            {darkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#FF685B]/5 to-white">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "you" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                message.sender === "you"
                  ? "bg-gradient-to-r from-[#FF685B] to-[#FF8A7A] text-white rounded-br-none"
                  : "bg-white text-gray-900 border border-[#FF685B]/20 rounded-bl-none"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p
                className={`text-xs mt-2 ${message.sender === "you" ? "text-white/80" : "text-gray-500"}`}
              >
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#FF685B]/20 p-3 rounded-lg rounded-bl-none flex items-center gap-2 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-[#FF685B]" />
              <span className="text-sm text-gray-600">
                Analyzing your message...
              </span>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-[#FF685B]/20 bg-white rounded-b-xl"
      >
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe your symptoms or ask a health question..."
            className="flex-1 border-[#FF685B]/30 focus:border-[#FF685B] focus:ring-[#FF685B]/20"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-[#FF685B] to-[#FF8A7A] hover:from-[#FF685B]/90 hover:to-[#FF8A7A]/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

const AppointmentsTable = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = useCurrentUser()?.id; // Get the current user's ID

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch real data from database
        const data = await getUserAppointmentData(currentUserId);
        setAppointments(data);
      } catch (err) {
        setError(err.message || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF685B] mx-auto mb-4" />
          <p className="text-gray-500">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <p>{error}</p>
        <Button
          className="mt-4 bg-gradient-to-r from-[#FF685B] to-[#FF8A7A]"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
            Upcoming Appointments
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage your scheduled healthcare visits
          </p>
        </div>
        <Button
          className="flex items-center gap-2 bg-gradient-to-r from-[#FF685B] to-[#FF8A7A] hover:from-[#FF685B]/90 hover:to-[#FF8A7A]/90 w-full sm:w-auto"
          asChild
        >
          <a href="/book-appointment">
            <Plus className="h-4 w-4" />
            Book New Appointment
          </a>
        </Button>
      </div>

      <Card className="shadow-lg border border-[#FF685B]/20 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-[#FF685B]/10 to-white">
              <TableHead className="font-semibold text-xs sm:text-sm">
                Appointment
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm">
                Date & Time
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm">
                Doctor
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm">
                Status
              </TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id} className="hover:bg-[#FF685B]/5">
                <TableCell className="font-medium text-xs sm:text-sm">
                  {appointment.patientName}
                </TableCell>
                <TableCell>
                  <div className="text-xs sm:text-sm">
                    <p className="font-medium">
                      {new Date(appointment.startTime).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                    <p className="text-gray-500">
                      {new Date(appointment.startTime).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs sm:text-sm">
                    <p className="font-medium">
                      {appointment.doctor?.name || "N/A"}
                    </p>
                    <p className="text-gray-500">
                      {appointment.doctor?.speciality || "N/A"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      appointment.status === "CONFIRMED"
                        ? "default"
                        : appointment.status === "PENDING"
                          ? "secondary"
                          : "destructive"
                    }
                    className="text-xs"
                  >
                    {appointment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {appointment.roomId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50 w-full sm:w-auto text-xs sm:text-sm"
                        asChild
                      >
                        <a href={`/room/${appointment.roomId}`}>
                          <Video className="h-4 w-4 mr-1" />
                          Join Call
                        </a>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default function ModernHealthDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = useCurrentUser() || "";

  const quickActions = [
    {
      title: "Book Appointment",
      icon: Calendar,
      href: "/appointment",
      color: "bg-gradient-to-r from-[#FF685B] to-[#FF8A7A]",
      description: "Schedule with doctors",
    },
    {
      title: "Lab Tests",
      icon: TestTube,
      href: "/lab",
      color: "bg-gradient-to-r from-green-500 to-green-600",
      description: "Order lab work",
    },
    {
      title: "Prescription",
      icon: FileText,
      href: "/prescription",
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      description: "Upload your Prescription",
    },
    {
      title: "Emergency",
      icon: Phone,
      href: "/emergency",
      color: "bg-gradient-to-r from-red-500 to-red-600",
      description: "Emergency contacts",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-[#FF685B] via-[#FF8A7A] to-[#FFA07A] rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                  Welcome back, {user?.name || 'Guest'}!
                </h1>
                <p className="text-white/90 text-lg">
                  Here's your health overview for today
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-sm text-white/80">Next Appointment</p>
                    <p className="font-semibold">Tomorrow at 2:00 PM</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-sm text-white/80">Health Score</p>
                    <p className="font-semibold">85/100</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 group border border-[#FF685B]/20">
                      <CardContent className="p-6 text-center">
                        <div
                          className={`${action.color} p-4 rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                        >
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {action.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Health Tips */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 mt-4">
                Health Tips
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {healthTips.map((tip) => (
                  <HealthTipCard key={tip.id} tip={tip} />
                ))}
              </div>
            </div>
          </div>
        );

      case "appointments":
        return <AppointmentsTable />;

      case "chatbot":
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Disease Prediction
              </h2>
              <p className="text-gray-500 mt-1">
                Get instant health guidance and symptom analysis
              </p>
            </div>
            <ChatbotInterface />
          </div>
        );

      case "metrics":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Health Metrics Dashboard
              </h2>
              <p className="text-gray-500 mt-1">
                Track your vital health indicators
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {healthMetrics.map((metric) => (
                <Card
                  key={metric.id}
                  className="p-6 shadow-lg border border-[#FF685B]/20 bg-gradient-to-br from-white to-[#FF685B]/5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{metric.name}</h3>
                    <div
                      className={`p-2 rounded-lg ${metric.status === "good" ? "bg-green-100" : metric.status === "warning" ? "bg-yellow-100" : "bg-red-100"}`}
                    >
                      {metric.icon}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold">
                      {metric.value}{" "}
                      <span className="text-lg text-gray-500">
                        {metric.unit}
                      </span>
                    </div>
                    <Progress value={75} className="h-3" />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>
                        Target:{" "}
                        {metric.name === "Daily Steps"
                          ? "10,000 steps"
                          : "Normal range"}
                      </span>
                      <span className="flex items-center gap-1">
                        {metric.trend === "up"
                          ? "↗️"
                          : metric.trend === "down"
                            ? "↘️"
                            : "➡️"}
                        {metric.trend}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case "medications":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Medications
                </h2>
                <p className="text-gray-500 mt-1">
                  Manage your prescriptions and reminders
                </p>
              </div>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-[#FF685B] to-[#FF8A7A] hover:from-[#FF685B]/90 hover:to-[#FF8A7A]/90">
                <Plus className="h-4 w-4" />
                Add Medication
              </Button>
            </div>
            <div className="grid gap-4">
              <Card className="p-6 shadow-lg border border-[#FF685B]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-[#FF685B]/20 to-[#FF8A7A]/20 rounded-lg">
                      <Pill className="h-6 w-6 text-[#FF685B]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Lisinopril 10mg</h3>
                      <p className="text-gray-500">Once daily, morning</p>
                      <p className="text-sm text-gray-400">
                        Next dose: Tomorrow 8:00 AM
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">14 days left</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 shadow-lg border border-[#FF685B]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-lg">
                      <Pill className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Metformin 500mg</h3>
                      <p className="text-gray-500">Twice daily, with meals</p>
                      <p className="text-sm text-gray-400">
                        Next dose: Today 6:00 PM
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">7 days left</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 shadow-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg">
                      <Pill className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Vitamin D3 1000IU</h3>
                      <p className="text-gray-500">
                        Once daily, with breakfast
                      </p>
                      <p className="text-sm text-gray-400">
                        Next dose: Tomorrow 8:00 AM
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      Low Stock
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">3 days left</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case "emergency":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Emergency Contacts
              </h2>
              <p className="text-gray-500 mt-1">
                Quick access to emergency services and contacts
              </p>
            </div>
            <div className="grid gap-4">
              <Card className="p-6 border-red-200 bg-gradient-to-r from-red-50 to-red-100 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500 rounded-lg shadow-lg">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900">
                      Emergency Services
                    </h3>
                    <p className="text-red-700 text-2xl font-bold">1122</p>
                  </div>
                  <Button className="bg-red-500 hover:bg-red-600 shadow-lg">
                    Call Now
                  </Button>
                </div>
              </Card>
              <Card className="p-6 shadow-lg border border-[#FF685B]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-[#FF685B]/20 to-[#FF8A7A]/20 rounded-lg">
                      <Stethoscope className="h-6 w-6 text-[#FF685B]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Primary Care Physician</h3>
                      <p className="text-gray-500">Dr. Sarah Johnson</p>
                      <p className="text-gray-400">(555) 123-4567</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="text-[#FF685B] border-[#FF685B]/30 hover:bg-[#FF685B]/10"
                  >
                    Call
                  </Button>
                </div>
              </Card>
              <Card className="p-6 shadow-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg">
                      <Heart className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Cardiologist</h3>
                      <p className="text-gray-500">Dr. Michael Smith</p>
                      <p className="text-gray-400">(555) 987-6543</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    Call
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-[#FF685B]/5">
      {/* Sidebar */}
      <CustomSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main content area */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-[#FF685B]/20 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-4 max-w-full">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#FF685B] to-[#FF8A7A] bg-clip-text text-transparent truncate">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 ">
              <NotificationButton />
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-[#FF685B]/10 dark:bg-black"
              >
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <ModeToggle />
              <UserButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
