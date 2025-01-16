"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";

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
      const [step, setStep] = useState<"name" | "symptom" | "select_symptom" | "days" | "follow_up" | "result">("name");
      const [matchedSymptoms, setMatchedSymptoms] = useState<string[]>([]);
      const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
      const [days, setDays] = useState<number>(0);
    
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
                text: `I found these matching symptoms: ${data.matched_symptoms.join(", ")}\nPlease select the one you meant (0 - ${data.matched_symptoms.length - 1}):`,
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
            if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= matchedSymptoms.length) {
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
    
              // Display result
              const botMessage: Message = {
                id: messages.length + 2,
                text: `Based on your symptoms, it seems you might have: **${data.disease}**\n\n**Description:** ${data.description}\n\n**Precautions:** ${data.precautions.join(", ")}\n\n**Severity:** ${data.severity_message}`,
                sender: "other",
              };
              setMessages((prevMessages) => [...prevMessages, botMessage]);
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
      const MessageComponent: React.FC<{ text: string; sender: "you" | "other"; darkMode: boolean }> = ({ text, sender, darkMode }) => {
        return (
          <div className={`flex ${sender === "you" ? "justify-end" : "justify-start"}`}>
            <div
              className={`p-3 rounded-lg max-w-[70%] ${
                sender === "you"
                  ? darkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
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
        <div className={`h-screen flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
          <header className="py-4 bg-black text-white font-bold text-lg flex justify-between items-center px-4">
            <h2>Symptoms Based Disease Prediction</h2>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </header>
          <div
            id="chat-container"
            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
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
          </div>
    
          <form onSubmit={handleSend} className="p-4 bg-white flex gap-2 border-t">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                step === "name" ? "Your Name?" :
                step === "symptom" ? "Enter the symptom you are experiencing:" :
                step === "select_symptom" ? "Select the symptom (0 - n):" :
                step === "days" ? "From how many days?" :
                step === "follow_up" ? "Are you experiencing any other symptoms? (yes/no)" :
                "Type your message..."
              }
              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" disabled={isSending} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              {isSending ? <Loader2 className="animate-spin" /> : "Send"}
            </Button>
          </form>
        </div>
      );
}