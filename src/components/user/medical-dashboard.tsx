"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
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
  Heart,
  Brain,
  Phone,
  Download,
  Plus,
  Settings,
  User,
  Stethoscope,
  AlertCircle,
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
  File,
} from "lucide-react";
import jsPDF from "jspdf";
import { ModeToggle } from "../mode-toggle";
import { UserButton } from "../auth/user-button";
import Link from "next/link";
import { NotificationButton } from "../auth/notification-button";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  getUpcomingUserAppointment,
  getUserAppointmentData,
} from "@/data/appointment-data";
import { LabTestsSection } from "../lab-test-sections";
import { UserChatbot } from "./user-chatbot";
import { appointment } from "@/actions/appointment";
import { getUpcomingLabTest } from "@/data/lab-test-data";

const emergencyContacts = [
  {
    title: "Edhi Ambulance",
    phone: "115",
    description: "24/7 emergency ambulance service by Edhi Foundation.",
  },
  {
    title: "Rescue 1122",
    phone: "1122",
    description: "Government emergency ambulance, fire, and rescue services.",
  },
  {
    title: "Police Emergency",
    phone: "15",
    description: "Report crimes and emergencies to the local police.",
  },
  {
    title: "Fire Brigade",
    phone: "16",
    description: "Call in case of fire emergencies.",
  },
  {
    title: "Pakistan Red Crescent",
    phone: "+92 51 9250404",
    description: "Emergency and disaster relief organization.",
  },
  {
    title: "Women’s Helpline",
    phone: "1099",
    description: "Support and legal help for women.",
  },
];

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
    { id: "labtests", title: "Lab Tests", icon: TestTube },
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
                  DocConnect
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
                {user?.name || "Guest"}!
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
  interface Message {
    timestamp: any;
    id: number;
    text: string;
    sender: "you" | "other";
  }

  const [userChatHistory, setUserChatHistory] = useState<{
    messages: { question: string; userResponse: string; botResponse: string }[];
    result: string | null;
  }>({ messages: [], result: null });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<
    "name" | "symptom" | "select_symptom" | "days" | "follow_up" | "result"
  >("name");
  const [matchedSymptoms, setMatchedSymptoms] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [days, setDays] = useState<number>(0);
  const [showAppointmentPrompt, setShowAppointmentPrompt] = useState(false);

  useEffect(() => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim() === "") return;

    const userMessage = inputValue;

    const currentStep = step;

    const newMessage: Message = {
      id: messages.length + 1,
      text: userMessage,
      sender: "you",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsSending(true);

    try {
      let botMessage: Message | null = null;

      if (step === "name") {
        botMessage = {
          id: messages.length + 2,
          text: `Hello ${userMessage}!How can I assist you today?\nThis chatbot is made to predict common diseases.\nRemember: You have to enter at least 4 to 6 symptoms for a better response.`,
          sender: "other",
          timestamp: new Date(),
        };
        setStep("symptom");
      } else if (currentStep === "symptom") {
        const response = await fetch("http://127.0.0.1:5000/match-symptoms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ symptom: userMessage }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.confidence === 1) {
            setMatchedSymptoms(data.matched_symptoms);
            botMessage = {
              id: messages.length + 2,
              text: `I found these matching symptoms: ${data.matched_symptoms.join(", ")}\nPlease select the one you meant (0 - ${data.matched_symptoms.length - 1}):`,
              sender: "other",
              timestamp: new Date(),
            };
            setStep("select_symptom");
          } else {
            botMessage = {
              id: messages.length + 2,
              text: "No matching symptoms found. Please try again.",
              sender: "other",
              timestamp: new Date(),
            };
          }
        }
      } else if (step === "select_symptom") {
        const selectedIndex = parseInt(userMessage);
        if (
          isNaN(selectedIndex) ||
          selectedIndex < 0 ||
          selectedIndex >= matchedSymptoms.length
        ) {
          botMessage = {
            id: messages.length + 2,
            text: "Invalid selection. Please try again.",
            sender: "other",
            timestamp: new Date(),
          };
        } else {
          const selectedSymptom = matchedSymptoms[selectedIndex];
          setSelectedSymptoms([...selectedSymptoms, selectedSymptom]);
          setStep("days");

          botMessage = {
            id: messages.length + 2,
            text: "Got it! From how many days have you been experiencing this?",
            sender: "other",
            timestamp: new Date(),
          };
        }
      } else if (step === "days") {
        const daysInput = parseInt(userMessage);
        if (isNaN(daysInput) || daysInput < 0) {
          botMessage = {
            id: messages.length + 2,
            text: "Invalid input. Please enter a valid number of days.",
            sender: "other",
            timestamp: new Date(),
          };
        } else {
          setDays(daysInput);
          setStep("follow_up");

          botMessage = {
            id: messages.length + 2,
            text: "Are you experiencing any other symptoms? (yes/no)",
            sender: "other",
            timestamp: new Date(),
          };
        }
      } else if (step === "follow_up") {
        if (userMessage.toLowerCase() === "yes") {
          setStep("symptom");
          botMessage = {
            id: messages.length + 2,
            text: "Please enter the next symptom you are experiencing:",
            sender: "other",
            timestamp: new Date(),
          };
        } else {
          setStep("result");

          const response = await fetch(
            "http://127.0.0.1:5000/predict-disease",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                symptoms: selectedSymptoms,
                days: days,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Server error");
          }

          const data = await response.json();

          const doctorRecommendations = data.doctor_recommendations
            .map(
              (doc: any) =>
                `- ${doc.doctor_name} (${doc.hospital}, Contact: ${doc.contact})`
            )
            .join("\n");

          botMessage = {
            id: messages.length + 2,
            text: `Based on your symptoms, it seems you might have: ${data.disease}\n\nDescription: ${data.description}\n\nPrecautions: ${data.precautions.join(", ")}\n\nSeverity: ${data.severity_message}\n\nRecommended Doctors:\n${doctorRecommendations}`,
            sender: "other",
            timestamp: new Date(),
          };

          setUserChatHistory((prev) => ({
            ...prev,
            result: data.disease,
          }));

          setShowAppointmentPrompt(true);
        }
      }

      if (botMessage) {
        setMessages((prev) => [...prev, botMessage]);
        setUserChatHistory((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              question: currentStep,
              userResponse: userMessage,
              botResponse: botMessage.text,
            },
          ],
        }));
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, something went wrong. Please try again.",
        sender: "other",
        timestamp: undefined,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const MessageComponent: React.FC<{
    text: string;
    sender: "you" | "other";
    darkMode: boolean;
  }> = ({ text, sender, darkMode }) => {
    return (
      <div
        className={`flex ${sender === "you" ? "justify-end " : "justify-start"}`}
      >
        <div
          className={`p-3 rounded-lg max-w-[70%] ${
            sender === "you"
              ? darkMode
                ? "bg-black text-white text-lg"
                : "bg-black text-white text-lg"
              : darkMode
                ? "bg-gray-700 text-white"
                : "bg-gray-200 text-black"
          }`}
        >
          {text}
        </div>
      </div>
    );
  };

  const exportChatHistoryToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    doc.setFontSize(18);
    doc.setTextColor(0, 0, 255);
    doc.text("Chat History Report", 10, 10);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    let yOffset = 20;

    userChatHistory.messages.forEach((entry, index) => {
      doc.setFontSize(14);
      doc.text(`Q${index + 1}: ${entry.question}`, 10, yOffset);

      doc.setFontSize(12);
      const userResponseLines = doc.splitTextToSize(
        `Your Response: ${entry.userResponse}`,
        180
      );
      doc.text(userResponseLines, 10, yOffset + 10);

      const botResponseLines = doc.splitTextToSize(
        `Bot Response: ${entry.botResponse}`,
        180
      );
      doc.text(botResponseLines, 10, yOffset + 20);

      yOffset +=
        10 + userResponseLines.length * 10 + botResponseLines.length * 10;

      if (yOffset > 250) {
        doc.addPage();
        yOffset = 20;
      }
    });

    if (userChatHistory.result) {
      doc.setFontSize(16);
      doc.setTextColor(0, 128, 0);
      doc.text("Conclusion:", 10, yOffset);
      doc.setFontSize(14);
      const resultLines = doc.splitTextToSize(userChatHistory.result, 180);
      doc.text(resultLines, 10, yOffset + 10);
    }

    doc.save("Chat_History_Report.pdf");
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
            onClick={exportChatHistoryToPDF}
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
              <div className="flex flex-col">
                <span
                  className={`text-xs mt-2 ${
                    message.sender === "you" ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {message.timestamp
                    ? new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
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
        onSubmit={handleSend}
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
  const currentUserId = useCurrentUser()?.id; 

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getUserAppointmentData(currentUserId);
        const formattedAppointments: Appointment[] = data.map(appointment => ({
          id: appointment.id,
          patientName: appointment.user?.name || 'Unknown',
          startTime: appointment.startTime.toISOString(),
          status: appointment.status,
          doctor: appointment.doctor ? {
            name: appointment.doctor.name || 'Unknown',
            speciality: appointment.doctor.speciality || 'General'
          } : undefined,
          roomId: appointment.roomId || undefined
        }));
        setAppointments(formattedAppointments);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load appointments";
        setError(errorMessage);
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
          <a href="/booking">
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

 interface DashboardAppointment {
    id: string;
    user: {
      image: string | null;
      name: string | null;
      id: string;
      email: string | null;
      password: string | null;
      emailVerified: Date | null;
      isTwoFactorEnabled: boolean;
      emailSubscriptionId: string | null;
    } | null;
    roomId: string | null;
    startTime: Date;
    patientName: string;
  }

  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = useCurrentUser() || "";

  const [appointment, setAppointment] = useState<DashboardAppointment | null>(null);
  const [labTest, setLabTest] = useState(null);
  const [loadingAppointment, setLoadingAppointment] = useState(true);
  const [loadingLabTest, setLoadingLabTest] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const upcomingAppointment = await getUpcomingUserAppointment(user.id);
        setAppointment(upcomingAppointment);
      } catch (error) {
        console.error("Failed to fetch appointment:", error);
      } finally {
        setLoadingAppointment(false);
      }

      try {
        const upcomingLab = await getUpcomingLabTest(user.id);
        setLabTest(upcomingLab);
      } catch (error) {
        console.error("Failed to fetch lab test:", error);
      } finally {
        setLoadingLabTest(false);
      }
    }

    if (user?.id) {
      fetchData();
    } else {
      setLoadingAppointment(false);
      setLoadingLabTest(false);
    }
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const quickActions = [
    {
      title: "Book Appointment",
      icon: Calendar,
      href: "/booking",
      color: "bg-gradient-to-r from-[#FF685B] to-[#FF8A7A]",
      description: "Schedule with doctors",
    },
    {
      title: "Lab Tests",
      icon: TestTube,
      href: "/booking",
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
      title: "Medical Report",
      icon: File,
      href: "/medireports",
      color: "bg-gradient-to-r from-red-500 to-red-600",
      description: "Analyze your medical report",
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
                  Welcome back, {user?.name || "Guest"}!
                </h1>
                <p className="text-white/90 text-lg">
                  Here's your health overview for today
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 min-w-[180px]">
                    <p className="text-sm text-white/80">Next Appointment</p>
                    <p className="font-semibold">
                      {loadingAppointment
                        ? "Loading..."
                        : appointment
                          ? `${appointment.patientName} on ${formatDate(appointment.startTime)}`
                          : "No upcoming appointments"}
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 min-w-[180px]">
                    <p className="text-sm text-white/80">Next Lab Test</p>
                    <p className="font-semibold">
                      {loadingLabTest
                        ? "Loading..."
                        : labTest
                          ? `${labTest.testType} on ${formatDate(labTest.testStartTime)}`
                          : "No upcoming lab tests"}
                    </p>
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

      case "labtests":
        return <LabTestsSection userId={user?.id} />;

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
                  <Button className="bg-red-700 text-black hover:bg-white shadow-lg">
                    Call Now
                  </Button>
                </div>
              </Card>
              <Card className="p-6 shadow-lg border border-[#FF685B]/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {emergencyContacts.map((contact, index) => (
                    <div
                      key={index}
                      className="border border-orange-200/50 shadow-sm rounded-2xl p-4 bg-orange-100/50 hover:shadow-md transition duration-300"
                    >
                      <h2 className="text-lg font-semibold text-red-600">
                        {contact.title}
                      </h2>
                      <p className="text-gray-700 mt-1 text-sm">
                        {contact.description}
                      </p>
                      <p className="mt-2 font-mono text-base text-gray-900">
                        📞 {contact.phone}
                      </p>
                    </div>
                  ))}
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
      <div className="flex-1 w-full mx-auto">
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
