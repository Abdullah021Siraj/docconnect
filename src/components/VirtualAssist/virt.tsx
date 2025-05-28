"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

interface Context {
  awaiting_option?: boolean;
  option_selected?: string | null;
  awaiting_medication_continue?: boolean;
}

export const VirtualAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Hello! I can help you with:\n1. Medication Information\n2. Follow-up Support\n3. Personalized Health Tips\n\nPlease choose an option (1-3)',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [context, setContext] = useState<Context>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: input }]);
    const trimmedInput = input.trim();
    setInput('');

    try {
      console.log('Sending request with input:', trimmedInput, 'and context:', context);
      const response = await fetch('http://localhost:5000/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: trimmedInput,
          context: context || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      setContext(data.context || {});
      setMessages((prev) => [...prev, { sender: 'assistant', text: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    }
  };

  const toggleChat = () => setIsOpen((prev) => !prev);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className={`p-4 rounded-full shadow-xl ${
          isOpen ? 'bg-rose-500' : 'bg-blue-600'
        } text-white transition-colors duration-300`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute bottom-20 right-0 w-96"
          >
            <div className="relative">
              <div className="rounded-xl overflow-hidden backdrop-blur-lg bg-white/20 border border-white/30 shadow-2xl">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white font-medium">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                    <span>Health Assistant</span>
                  </div>
                </div>
                <div className="h-96 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2 whitespace-pre-wrap ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-white/90 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        {message.text}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSubmit} className="p-3 border-t border-white/20">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-white/30"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
              <div className="absolute -bottom-3 right-4 w-6 h-6 overflow-hidden">
                <div className="absolute w-4 h-4 bg-white/20 backdrop-blur-sm -bottom-3 right-0 transform rotate-45 border border-white/30"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};