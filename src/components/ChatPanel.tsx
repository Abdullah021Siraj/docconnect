"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageCircle, X, Users } from "lucide-react"
import { format } from "date-fns"

interface Message {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: number
  type: "text" | "system"
}

interface ChatPanelProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  currentUserId: string
  isOpen: boolean
  onToggle: () => void
  unreadCount: number
  onMarkAsRead: () => void
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  currentUserId,
  isOpen,
  onToggle,
  unreadCount,
  onMarkAsRead,
}) => {
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      onMarkAsRead()
      inputRef.current?.focus()
    }
  }, [messages, isOpen, onMarkAsRead])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg z-50"
        size="lg"
      >
        <div className="relative">
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>
            </div>
          )}
        </div>
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 h-96 bg-white/95 backdrop-blur-sm border-2 border-orange-200 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-orange-25">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900">Chat</h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Users className="h-3 w-3" />
            <span>{messages.filter((m) => m.type === "text").length}</span>
          </div>
        </div>
        <Button onClick={onToggle} variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-500 hover:text-gray-700">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.userId === currentUserId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.type === "system"
                      ? "bg-gray-100 text-gray-600 text-center text-xs"
                      : message.userId === currentUserId
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                        : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.type === "text" && message.userId !== currentUserId && (
                    <div className="text-xs font-medium mb-1 opacity-75">{message.userName}</div>
                  )}
                  <div className="text-sm break-words">{message.message}</div>
                  <div
                    className={`text-xs mt-1 opacity-75 ${
                      message.userId === currentUserId ? "text-orange-100" : "text-gray-500"
                    }`}
                  >
                    {format(new Date(message.timestamp), "HH:mm")}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-orange-100">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
            maxLength={500}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Press Enter to send • {500 - newMessage.length} characters left
        </div>
      </form>
    </Card>
  )
}
