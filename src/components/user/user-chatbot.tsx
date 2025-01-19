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
              text: `Hello ${userMessage}! 👋 How can I assist you today?\nThis chatbot is made to predict common diseases.\nRemember: You have to enter at least 4 to 6 symptoms for a better response.`,
              sender: "other",
            };
            setStep("symptom");
          } else if (step === "symptom") {
            // Simulate fetching symptoms from the server
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
          } else if (step === "result") {
            const response = await fetch("http://127.0.0.1:5000/predict-disease", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ symptoms: selectedSymptoms, days }),
            });
      
            if (response.ok) {
              const data = await response.json();
              botMessage = {
                id: messages.length + 2,
                text: `Based on your symptoms, it seems you might have: **${data.disease}**\n\n**Description:** ${data.description}\n\n**Precautions:** ${data.precautions.join(", ")}\n\n**Severity:** ${data.severity_message}`,
                sender: "other",
              };
      
              // Update the chat history with the result
              setUserChatHistory((prev) => ({
                ...prev,
                result: data.disease,
              }));
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
      
        // Title
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 255); // Blue color for title
        doc.text("Chat History Report", 10, 10);
        doc.setTextColor(0, 0, 0); // Reset text color to black
      
        // Add chat messages
        userChatHistory.messages.forEach((entry, index) => {
          const yOffset = 20 + index * 40; // Adjust Y position for each message
          doc.setFontSize(14);
      
          doc.text(`Q${index + 1}:`, 10, yOffset);
          doc.setFontSize(12);
          doc.text(entry.question, 20, yOffset);
          doc.text(`Your Response: ${entry.userResponse}`, 10, yOffset + 10);
          doc.text(`Bot Response: ${entry.botResponse}`, 10, yOffset + 30);
          doc.addPage(); // Adding page break after each message
        });
      
        // Final Result
        if (userChatHistory.result) {
          doc.setFontSize(16);
          doc.setTextColor(0, 128, 0); // Green color for conclusion
          doc.text("Conclusion:", 10, 20 + userChatHistory.messages.length * 40);
          doc.setFontSize(14);
          doc.text(userChatHistory.result, 10, 25 + userChatHistory.messages.length * 40);
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
    