"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { EditIcon, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import { UserInfo } from "../user-info";
import Link from "next/link";
import { Card } from "../ui/card";
import { useCurrentUser } from "@/hooks/use-current-user";

export const UserChatbot = () => {
  interface Message {
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
  const [step, setStep] = useState<
    "name" | "symptom" | "select_symptom" | "days" | "follow_up" | "result"
  >("name");
  const [matchedSymptoms, setMatchedSymptoms] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [days, setDays] = useState<number>(0);
  const [showAppointmentPrompt, setShowAppointmentPrompt] = useState(false); // New state for appointment prompt

  // Scroll to the bottom of the chat when new messages are added
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

    // Add the user's message to chat
    const newMessage: Message = {
      id: messages.length + 1,
      text: userMessage,
      sender: "you",
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
        };
        setStep("symptom");
      } else if (step === "symptom") {
        // Fetch matching symptoms from the server
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
            };
            setStep("select_symptom");
          } else {
            botMessage = {
              id: messages.length + 2,
              text: "No matching symptoms found. Please try again.",
              sender: "other",
            };
          }
        }
      } else if (step === "select_symptom") {
        // Handle symptom selection
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
          };
        } else {
          const selectedSymptom = matchedSymptoms[selectedIndex];
          setSelectedSymptoms([...selectedSymptoms, selectedSymptom]);
          setStep("days");

          // Ask for number of days
          botMessage = {
            id: messages.length + 2,
            text: "Got it! From how many days have you been experiencing this?",
            sender: "other",
          };
        }
      } else if (step === "days") {
        // Handle days input
        const daysInput = parseInt(userMessage);
        if (isNaN(daysInput) || daysInput < 0) {
          botMessage = {
            id: messages.length + 2,
            text: "Invalid input. Please enter a valid number of days.",
            sender: "other",
          };
        } else {
          setDays(daysInput);
          setStep("follow_up");

          // Ask follow-up questions
          botMessage = {
            id: messages.length + 2,
            text: "Are you experiencing any other symptoms? (yes/no)",
            sender: "other",
          };
        }
      } else if (step === "follow_up") {
        // Handle follow-up questions
        if (userMessage.toLowerCase() === "yes") {
          setStep("symptom");
          botMessage = {
            id: messages.length + 2,
            text: "Please enter the next symptom you are experiencing:",
            sender: "other",
          };
        } else {
          setStep("result");

          // Predict disease
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

          // Format doctor recommendations
          const doctorRecommendations = data.doctor_recommendations
            .map(
              (doc: any) =>
                `- ${doc.doctor_name} (${doc.hospital}, Contact: ${doc.contact})`
            )
            .join("\n");

          // Display result with doctor recommendations
          botMessage = {
            id: messages.length + 2,
            text: `Based on your symptoms, it seems you might have: ${data.disease}\n\nDescription: ${data.description}\n\nPrecautions: ${data.precautions.join(", ")}\n\nSeverity: ${data.severity_message}\n\nRecommended Doctors:\n${doctorRecommendations}`,
            sender: "other",
          };

          // Update the chat history with the result
          setUserChatHistory((prev) => ({
            ...prev,
            result: data.disease,
          }));

          // Show appointment booking prompt
          setShowAppointmentPrompt(true);
        }
      }

      if (botMessage) {
        // Add bot response to the messages
        setMessages((prev) => [...prev, botMessage]);

        // Update the chat history
        setUserChatHistory((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              question: step,
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
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // Message Component (Embedded)
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

    // Set initial font size and style
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 255); // Blue color for title
    doc.text("Chat History Report", 10, 10);
    doc.setTextColor(0, 0, 0); // Reset text color to black
    doc.setFontSize(12);

    let yOffset = 20; // Initial Y position for content

    // Add chat messages
    userChatHistory.messages.forEach((entry, index) => {
      // Add question
      doc.setFontSize(14);
      doc.text(`Q${index + 1}: ${entry.question}`, 10, yOffset);

      // Add user response
      doc.setFontSize(12);
      const userResponseLines = doc.splitTextToSize(
        `Your Response: ${entry.userResponse}`,
        180
      );
      doc.text(userResponseLines, 10, yOffset + 10);

      // Add bot response
      const botResponseLines = doc.splitTextToSize(
        `Bot Response: ${entry.botResponse}`,
        180
      );
      doc.text(botResponseLines, 10, yOffset + 20);

      // Update Y position for the next entry
      yOffset +=
        10 + userResponseLines.length * 10 + botResponseLines.length * 10;

      // Add a new page if the content exceeds the page height
      if (yOffset > 250) {
        doc.addPage();
        yOffset = 20; // Reset Y position for the new page
      }
    });

    // Final Result
    if (userChatHistory.result) {
      doc.setFontSize(16);
      doc.setTextColor(0, 128, 0); // Green color for conclusion
      doc.text("Conclusion:", 10, yOffset);
      doc.setFontSize(14);
      const resultLines = doc.splitTextToSize(userChatHistory.result, 180);
      doc.text(resultLines, 10, yOffset + 10);
    }

    // Save PDF
    doc.save("Chat_History_Report.pdf");
  };

  const user = useCurrentUser();

  return (
    <>
      {/* Header Section */}
      <div className="w-full px-4 pt-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-gradient mb-3">
            Disease Prediction Chatbot
          </h2>
          <p className="text-lg text-white leading-relaxed max-w-3xl">
            Get personalized health insights and predictions with our advanced
            disease detection tool. Enter your symptoms to receive reliable
            predictions and next steps.
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
  {/* Chat Interface Card */}
  <div className="w-full max-w-7xl bg-gradient-to-r from-[#FFFFFF] to-[#FF685B] rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl border border-gray-200 overflow-hidden">
    {/* Chat Header */}
    <header className="bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <div className="bg-red-500 p-1.5 sm:p-2 rounded-md sm:rounded-lg shadow-sm">
          <span className="text-lg sm:text-xl">🩺</span>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
          Health Assistant
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
        <Button
          onClick={exportChatHistoryToPDF}
          className="bg-white/90 hover:bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg shadow-sm transition-all border border-gray-200 text-gray-800 hover:text-red-500 text-xs sm:text-sm"
        >
          Download PDF
        </Button>
        <Button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-white/90 hover:bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg shadow-sm transition-all border border-gray-200 text-gray-800 hover:text-red-500 text-xs sm:text-sm"
        >
          {darkMode ? (
            <>
              <span className="hidden sm:inline">☀️ Light</span>
              <span className="sm:hidden">☀️</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">🌙 Dark</span>
              <span className="sm:hidden">🌙</span>
            </>
          )}
        </Button>
      </div>
    </header>

          {/* Chat Messages Area */}
          <div className="px-6 py-4 h-[12vh] flex flex-col">
            <div
              id="chat-container"
              className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar"
            >
              {messages.map((msg) => (
                <MessageComponent
                  key={msg.id}
                  text={msg.text}
                  sender={msg.sender}
                  darkMode={darkMode}
                />
              ))}

              {isSending && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span className="text-sm">Analyzing symptoms...</span>
                </div>
              )}

              {showAppointmentPrompt && (
                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-gray-200 shadow-sm max-w-xl">
                  <p className="text-gray-700 text-sm mb-2">
                    Book an appointment with a recommended specialist?
                  </p>
                  <a
                    href="/appointment"
                    className="text-red-500 hover:text-red-600 font-medium transition-colors text-sm"
                  >
                    Schedule Consultation →
                  </a>
                </div>
              )}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSend} className="mt-4">
              <div className="flex gap-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-gray-200 shadow-sm">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    step === "name"
                      ? "Your Name?"
                      : step === "symptom"
                      ? "Describe your symptoms..."
                      : step === "select_symptom"
                      ? "Select symptoms..."
                      : step === "days"
                      ? "Duration of symptoms?"
                      : step === "follow_up"
                      ? "Any other symptoms? (yes/no)"
                      : "Type your message..."
                  }
                  className="flex-1 py-3 px-4 border-0 rounded-lg bg-transparent text-gray-800 focus:ring-2 focus:ring-red-300 text-sm"
                />
                <Button
                  type="submit"
                  disabled={isSending}
                  className="py-3 px-6 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm text-sm"
                >
                  {isSending ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Send →"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="w-full max-w-7xl">
          <Card className="p-6 shadow-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <span className="text-2xl text-purple-600">👤</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black">
                  Your Profile
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your health preferences and information
                </p>
              </div>
            </div>

            <UserInfo
              label="User Information"
              user={user}
              className="space-y-3 text-black"
            />

            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                className="bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 border border-purple-200"
                asChild
              >
                <Link
                  href="/settings"
                  className="flex items-center gap-2 text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Profile
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};