"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { WebRTCManager } from "@/src/lib/webrtc"

interface RemotePeer {
  id: string
  name: string
  stream: MediaStream
  connectionState: RTCPeerConnectionState
}

export const useWebRTC = (roomId: string, userId: string, userName: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([])
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<
    Array<{
      id: string
      userId: string
      userName: string
      message: string
      timestamp: number
      type: "text" | "system"
    }>
  >([])
  const [unreadCount, setUnreadCount] = useState(0)

  const webrtcManagerRef = useRef<WebRTCManager | null>(null)

  const handleStreamAdded = useCallback((peerId: string, stream: MediaStream, name: string) => {
    setRemotePeers((prev) => {
      const existing = prev.find((p) => p.id === peerId)
      if (existing) {
        return prev.map((p) => (p.id === peerId ? { ...p, stream, name } : p))
      }
      return [...prev, { id: peerId, name, stream, connectionState: "connecting" }]
    })
  }, [])

  const handleStreamRemoved = useCallback((peerId: string) => {
    setRemotePeers((prev) => prev.filter((p) => p.id !== peerId))
  }, [])

  const handleConnectionStateChange = useCallback((peerId: string, state: RTCPeerConnectionState) => {
    setRemotePeers((prev) => prev.map((p) => (p.id === peerId ? { ...p, connectionState: state } : p)))
  }, [])

  const handleChatMessage = useCallback((messageData: any) => {
    setMessages((prev) => [...prev, messageData])
    setUnreadCount((prev) => prev + 1)
  }, [])

  const initializeWebRTC = useCallback(async () => {
    try {
      setConnectionStatus("connecting")
      setError(null)

      const manager = new WebRTCManager(roomId, userId, userName, {
        onStreamAdded: handleStreamAdded,
        onStreamRemoved: handleStreamRemoved,
        onConnectionStateChange: handleConnectionStateChange,
        onChatMessage: handleChatMessage,
      })

      webrtcManagerRef.current = manager

      // Initialize media
      const stream = await manager.initializeMedia({ video: true, audio: true })
      setLocalStream(stream)

      // Connect to room
      await manager.connectToRoom()
      setConnectionStatus("connected")
    } catch (err) {
      console.error("Failed to initialize WebRTC:", err)
      setError(err instanceof Error ? err.message : "Failed to initialize video call")
      setConnectionStatus("disconnected")
    }
  }, [roomId, userId, userName, handleStreamAdded, handleStreamRemoved, handleConnectionStateChange, handleChatMessage])

  const toggleVideo = useCallback(async () => {
    if (webrtcManagerRef.current) {
      const newState = !isVideoEnabled
      await webrtcManagerRef.current.toggleVideo(newState)
      setIsVideoEnabled(newState)
    }
  }, [isVideoEnabled])

  const toggleAudio = useCallback(async () => {
    if (webrtcManagerRef.current) {
      const newState = !isAudioEnabled
      await webrtcManagerRef.current.toggleAudio(newState)
      setIsAudioEnabled(newState)
    }
  }, [isAudioEnabled])

  const startScreenShare = useCallback(async () => {
    if (webrtcManagerRef.current && !isScreenSharing) {
      try {
        await webrtcManagerRef.current.startScreenShare()
        setIsScreenSharing(true)
      } catch (err) {
        console.error("Failed to start screen share:", err)
        setError("Failed to start screen sharing")
      }
    }
  }, [isScreenSharing])

  const stopScreenShare = useCallback(async () => {
    if (webrtcManagerRef.current && isScreenSharing) {
      await webrtcManagerRef.current.stopScreenShare()
      setIsScreenSharing(false)
    }
  }, [isScreenSharing])

  const leaveRoom = useCallback(() => {
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.leaveRoom()
      webrtcManagerRef.current = null
    }
    setLocalStream(null)
    setRemotePeers([])
    setConnectionStatus("disconnected")
    setIsVideoEnabled(true)
    setIsAudioEnabled(true)
    setIsScreenSharing(false)
  }, [])

  const sendMessage = useCallback(
    (message: string) => {
      if (webrtcManagerRef.current && message.trim()) {
        const messageData = {
          id: Date.now().toString(),
          userId,
          userName,
          message: message.trim(),
          timestamp: Date.now(),
          type: "text" as const,
        }

        // Add to local messages
        setMessages((prev) => [...prev, messageData])

        // Send to other participants
        webrtcManagerRef.current.sendChatMessage(messageData)
      }
    },
    [userId, userName],
  )

  const markMessagesAsRead = useCallback(() => {
    setUnreadCount(0)
  }, [])

  useEffect(() => {
    initializeWebRTC()

    return () => {
      leaveRoom()
    }
  }, [initializeWebRTC, leaveRoom])

  return {
    localStream,
    remotePeers,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    connectionStatus,
    error,
    messages,
    unreadCount,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    leaveRoom,
    reconnect: initializeWebRTC,
    sendMessage,
    markMessagesAsRead,
  }
}
