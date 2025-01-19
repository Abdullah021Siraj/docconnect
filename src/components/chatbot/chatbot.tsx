"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { BellRing, Check, Loader2 } from "lucide-react";
import { Card, CardFooter } from "@/components/ui/card";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Switch } from "../ui/switch";

export const Chatbot = () => {
  interface Message {
    id: number;
    text: string;
    sender: "you" | "other";
  }

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

    // Add user's message to the chat
    const newMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "you",
    };
    setMessages([...messages, newMessage]);
    setInputValue("");
    setIsSending(true);

    try {
      if (step === "name") {
        // Greet the user
        const botMessage: Message = {
          id: messages.length + 2,
          text: `Hello ${inputValue}! 👋 How can I assist you today?\nThis chatbot is made to predict common diseases.\nRemember: You have to enter at least 4 to 6 symptoms for a better response.`,
          sender: "other",
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setStep("symptom");
      } else if (step === "symptom") {
        // Match symptoms
        const response = await fetch("http://127.0.0.1:5000/match-symptoms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symptom: inputValue,
          }),
        });

        if (!response.ok) {
          throw new Error("Server error");
        }

        const data = await response.json();
        if (data.confidence === 1) {
          setMatchedSymptoms(data.matched_symptoms);
          setStep("select_symptom");

          // Display matched symptoms
          const botMessage: Message = {
            id: messages.length + 2,
            text: `I found these matching symptoms: ${data.matched_symptoms.join(
              ", "
            )}\nPlease select the one you meant (0 - ${
              data.matched_symptoms.length - 1
            }):`,
            sender: "other",
          };
          setMessages((prevMessages) => [...prevMessages, botMessage]);
        } else {
          const botMessage: Message = {
            id: messages.length + 2,
            text: "No matching symptoms found. Please try again.",
            sender: "other",
          };
          setMessages((prevMessages) => [...prevMessages, botMessage]);
        }
      } else if (step === "select_symptom") {
        // Handle symptom selection
        const selectedIndex = parseInt(inputValue);
        if (
          isNaN(selectedIndex) ||
          selectedIndex < 0 ||
          selectedIndex >= matchedSymptoms.length
        ) {
          const botMessage: Message = {
            id: messages.length + 2,
            text: "Invalid selection. Please try again.",
            sender: "other",
          };
          setMessages((prevMessages) => [...prevMessages, botMessage]);
        } else {
          const selectedSymptom = matchedSymptoms[selectedIndex];
          setSelectedSymptoms([...selectedSymptoms, selectedSymptom]);
          setStep("days");

          // Ask for number of days
          const botMessage: Message = {
            id: messages.length + 2,
            text: "Got it! From how many days have you been experiencing this?",
            sender: "other",
          };
          setMessages((prevMessages) => [...prevMessages, botMessage]);
        }
      } else if (step === "days") {
        // Handle days input
        const daysInput = parseInt(inputValue);
        if (isNaN(daysInput) || daysInput < 0) {
          const botMessage: Message = {
            id: messages.length + 2,
            text: "Invalid input. Please enter a valid number of days.",
            sender: "other",
          };
          setMessages((prevMessages) => [...prevMessages, botMessage]);
        } else {
          setDays(daysInput);
          setStep("follow_up");

          // Ask follow-up questions
          const botMessage: Message = {
            id: messages.length + 2,
            text: "Are you experiencing any other symptoms? (yes/no)",
            sender: "other",
          };
          setMessages((prevMessages) => [...prevMessages, botMessage]);
        }
      } else if (step === "follow_up") {
        // Handle follow-up questions
        if (inputValue.toLowerCase() === "yes") {
          setStep("symptom");
          const botMessage: Message = {
            id: messages.length + 2,
            text: "Please enter the next symptom you are experiencing:",
            sender: "other",
          };
          setMessages((prevMessages) => [...prevMessages, botMessage]);
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
          const botMessage: Message = {
            id: messages.length + 2,
            text: `Based on your symptoms, it seems you might have: ${
              data.disease
            }\n\nDescription: ${
              data.description
            }\n\nPrecautions: ${data.precautions.join(", ")}\n\nSeverity: ${
              data.severity_message
            }\n\nRecommended Doctors:\n${doctorRecommendations}`,
            sender: "other",
          };
          setMessages((prevMessages) => [...prevMessages, botMessage]);

          // Show appointment booking prompt
          setShowAppointmentPrompt(true);
        }
      }
    } catch (error) {
      console.error("Error:", error);

      // Add error message to the chat
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, something went wrong. Please try again.",
        sender: "other",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
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
        className={`flex ${sender === "you" ? "justify-end" : "justify-start"}`}
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

  return (
    <>
      {/* Right Side Chat Container */}
      <div
        className={`flex items-center justify-center ${
          darkMode ? "text-white" : "text-black"
        } px-6 py-10`}
      >
        <div
          className="w-full bg-gradient-to-r from-[#FFFFFF] to-[#FF685B] max-w-[900px] bg-[#FF685B] text-white rounded-lg shadow-lg flex flex-col overflow-hidden border border-gray-700"
          style={{ marginTop: "2rem", marginBottom: "2rem", padding: "2rem" }}
        >
          <header className="py-4 text-black font-bold text-2xl flex justify-between items-center px-6">
            <h2>🩺 Disease Prediction Chatbot</h2>
            <Button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-white px-6 py-2 rounded hover:bg-gray-700 transition-colors text-sm"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </Button>
          </header>

          <div
            id="chat-container"
            className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
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
              <div className="flex justify-start">
                <div className="bg-gray-200 p-3 rounded-lg max-w-[70%]">
                  <Loader2 className="animate-spin" />
                </div>
              </div>
            )}

            {/* Appointment Booking Prompt */}
            {showAppointmentPrompt && (
              <div className="flex justify-start">
                <div className="bg-gray-200 p-3 rounded-lg max-w-[70%]">
                  <p>
                    Do you want to book an appointment with a recommended doctor?{" "}
                    <a
                      href="http://localhost:3000/appointment"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      Click here to book an appointment.
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="p-1 rounded-lg flex gap-4 border-rounded-xl border-gray-700"
          >
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                step === "name"
                  ? "Your Name?"
                  : step === "symptom"
                  ? "Enter the symptom you are experiencing..."
                  : step === "select_symptom"
                  ? "Select the symptom (0 - n):"
                  : step === "days"
                  ? "From how many days?"
                  : step === "follow_up"
                  ? "Are you experiencing any other symptoms? (yes/no)"
                  : "Type your message..."
              }
              className="flex-1 py-6 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white text-black"
            />
            <Button
              type="submit"
              disabled={isSending}
              className="py-6 px-16 border-black border-white bg-white text-black rounded-lg hover:bg-orange-600 transition-colors"
            >
              {isSending ? <Loader2 className="animate-spin" /> : "Send"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};
