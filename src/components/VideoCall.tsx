"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { useWebRTC } from "@/src/hooks/useWebRTC"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Users,
  Wifi,
  WifiOff,
  Settings,
} from "lucide-react"
import { ChatPanel } from "./ChatPanel"


interface VideoCallProps {
  roomId: string
  userId: string
  userName: string
  onLeave?: () => void
}

const VideoStream: React.FC<{
  stream: MediaStream | null
  name: string
  isLocal?: boolean
  connectionState?: RTCPeerConnectionState
  isMainView?: boolean
}> = ({ stream, name, isLocal = false, connectionState, isMainView = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const getConnectionIcon = () => {
    if (isLocal) return null

    switch (connectionState) {
      case "connected":
        return <Wifi className="h-3 w-3 text-green-500" />
      case "connecting":
        return <Wifi className="h-3 w-3 text-orange-500 animate-pulse" />
      case "disconnected":
      case "failed":
        return <WifiOff className="h-3 w-3 text-red-500" />
      default:
        return <Wifi className="h-3 w-3 text-gray-500" />
    }
  }

  const hasVideo = stream?.getVideoTracks().some((track) => track.enabled)

  return (
    <Card
      className={`relative overflow-hidden bg-gradient-to-br from-orange-50 to-white border-2 border-orange-100 shadow-lg ${
        isMainView ? "h-full" : "aspect-video"
      }`}
    >
      {hasVideo ? (
        <video ref={videoRef} autoPlay playsInline muted={isLocal} className="w-full h-full object-cover rounded-lg" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
          <div className="text-center text-orange-700">
            <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-orange-800">{name.charAt(0).toUpperCase()}</span>
            </div>
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs opacity-75 mt-1">Camera off</p>
          </div>
        </div>
      )}

      {/* Name overlay */}
      <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 backdrop-blur-sm">
        <span className="font-medium">
          {name} {isLocal && "(You)"}
        </span>
        {getConnectionIcon()}
      </div>

      {/* Audio indicator */}
      {stream && (
        <div className="absolute top-3 right-3">
          {stream.getAudioTracks().some((track) => track.enabled) ? (
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Mic className="h-4 w-4 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <MicOff className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export const VideoCall: React.FC<VideoCallProps> = ({ roomId, userId, userName, onLeave }) => {
  const [isChatOpen, setIsChatOpen] = useState(false)

  const {
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
    reconnect,
    sendMessage,
    markMessagesAsRead,
  } = useWebRTC(roomId, userId, userName)

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  const handleLeave = () => {
    leaveRoom()
    onLeave?.()
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center bg-white border-2 border-orange-200 shadow-xl">
          <div className="text-orange-500 mb-6">
            <VideoOff className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Connection Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={reconnect} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              Try Again
            </Button>
            <Button
              onClick={handleLeave}
              variant="outline"
              className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              Leave Room
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const totalParticipants = remotePeers.length + 1
  const mainPeer = remotePeers[0] // Show first remote peer as main view
  const otherPeers = remotePeers.slice(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-white flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-orange-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Medical Consultation</h1>
              <p className="text-sm text-gray-600">Room: {roomId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full border border-orange-200">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "connecting"
                    ? "bg-orange-500 animate-pulse"
                    : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-700 font-medium capitalize">{connectionStatus}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
            {totalParticipants} participant{totalParticipants !== 1 ? "s" : ""}
          </div>
          <Button variant="outline" size="sm" className="border-orange-200 text-orange-700 hover:bg-orange-50">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 lg:p-6">
        {totalParticipants === 1 ? (
          // Solo view
          <div className="h-full max-w-4xl mx-auto">
            <VideoStream stream={localStream} name={userName} isLocal={true} isMainView={true} />
          </div>
        ) : totalParticipants === 2 ? (
          // Two-person view
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full max-w-6xl mx-auto">
            <VideoStream stream={localStream} name={userName} isLocal={true} isMainView={true} />
            {mainPeer && (
              <VideoStream
                stream={mainPeer.stream}
                name={mainPeer.name}
                connectionState={mainPeer.connectionState}
                isMainView={true}
              />
            )}
          </div>
        ) : (
          // Multi-person view with main speaker
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full max-w-7xl mx-auto">
            {/* Main view */}
            <div className="lg:col-span-3 h-full">
              {mainPeer ? (
                <VideoStream
                  stream={mainPeer.stream}
                  name={mainPeer.name}
                  connectionState={mainPeer.connectionState}
                  isMainView={true}
                />
              ) : (
                <VideoStream stream={localStream} name={userName} isLocal={true} isMainView={true} />
              )}
            </div>

            {/* Sidebar with other participants */}
            <div className="space-y-4 lg:max-h-full lg:overflow-y-auto">
              {!mainPeer && <VideoStream stream={localStream} name={userName} isLocal={true} />}
              {mainPeer && <VideoStream stream={localStream} name={userName} isLocal={true} />}
              {otherPeers.map((peer) => (
                <VideoStream
                  key={peer.id}
                  stream={peer.stream}
                  name={peer.name}
                  connectionState={peer.connectionState}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-orange-100 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 lg:gap-6">
            <Button
              onClick={toggleAudio}
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              className={`rounded-full w-14 h-14 p-0 transition-all duration-200 ${
                isAudioEnabled ? "bg-orange-500 hover:bg-orange-600 shadow-lg" : "bg-red-500 hover:bg-red-600 shadow-lg"
              }`}
            >
              {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>

            <Button
              onClick={toggleVideo}
              variant={isVideoEnabled ? "default" : "destructive"}
              size="lg"
              className={`rounded-full w-14 h-14 p-0 transition-all duration-200 ${
                isVideoEnabled ? "bg-orange-500 hover:bg-orange-600 shadow-lg" : "bg-red-500 hover:bg-red-600 shadow-lg"
              }`}
            >
              {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>

            <Button
              onClick={isScreenSharing ? stopScreenShare : startScreenShare}
              variant={isScreenSharing ? "default" : "outline"}
              size="lg"
              className={`rounded-full w-14 h-14 p-0 transition-all duration-200 ${
                isScreenSharing
                  ? "bg-orange-500 hover:bg-orange-600 shadow-lg"
                  : "border-2 border-orange-200 text-orange-600 hover:bg-orange-50"
              }`}
            >
              {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
            </Button>

            <div className="w-px h-8 bg-orange-200 mx-2" />

            <Button
              onClick={handleLeave}
              variant="destructive"
              size="lg"
              className="rounded-full w-14 h-14 p-0 bg-red-500 hover:bg-red-600 shadow-lg transition-all duration-200"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>

          {/* Status indicators */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-600">
            {isScreenSharing && (
              <div className="flex items-center gap-2 bg-orange-100 px-3 py-1.5 rounded-full">
                <Monitor className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Screen sharing active</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>End-to-end encrypted</span>
            </div>
          </div>
        </div>
      </div>
      {/* Chat Panel */}
      <ChatPanel
        messages={messages}
        onSendMessage={sendMessage}
        currentUserId={userId}
        isOpen={isChatOpen}
        onToggle={toggleChat}
        unreadCount={unreadCount}
        onMarkAsRead={markMessagesAsRead}
      />
    </div>
  )
}
