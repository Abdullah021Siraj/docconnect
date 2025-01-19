"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";
import jsPDF from "jspdf";

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
  const [step, setStep] = useState<"name" | "symptom" | "select_symptom" | "days" | "follow_up" | "result">("name");
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
          const response = await fetch("http://127.0.0.1:5000/predict-disease", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              symptoms: selectedSymptoms,
              days: days,
            }),
          });

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
            { question: step, userResponse: userMessage, botResponse: botMessage.text },
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
  const MessageComponent: React.FC<{ text: string; sender: "you" | "other"; darkMode: boolean }> = ({ text, sender, darkMode }) => {
    return (
      <div className={`flex ${sender === "you" ? "justify-end " : "justify-start"}`}>
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
      const userResponseLines = doc.splitTextToSize(`Your Response: ${entry.userResponse}`, 180);
      doc.text(userResponseLines, 10, yOffset + 10);

      // Add bot response
      const botResponseLines = doc.splitTextToSize(`Bot Response: ${entry.botResponse}`, 180);
      doc.text(botResponseLines, 10, yOffset + 20);

      // Update Y position for the next entry
      yOffset += 10 + userResponseLines.length * 10 + botResponseLines.length * 10;

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

  return (
    <div
      className={`flex basis-1/2 ${darkMode ? "text-white" : " text-black"} px-6 py-10`}
    >
      <div
        className="w-full bg-gradient-to-r from-[#FFFFFF] to-[#FF685B] max-w-[900px] bg-[#FF685B] text-white rounded-lg shadow-lg flex flex-col overflow-hidden border border-gray-700"
        style={{ marginTop: "2rem", marginBottom: "2rem", padding: "2rem" }}
      >
        <header className="py-4 text-black font-bold text-2xl flex justify-between items-center px-6 ">
          <h2 className="mr-2">🩺 Disease Prediction Chatbot</h2>
          <Button onClick={exportChatHistoryToPDF}>Download Chat History as PDF</Button>
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
            <MessageComponent key={msg.id} text={msg.text} sender={msg.sender} darkMode={darkMode} />
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

        <form onSubmit={handleSend} className="p-1 rounded-lg flex gap-4 border-rounded-xl border-gray-700">
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
  );
};