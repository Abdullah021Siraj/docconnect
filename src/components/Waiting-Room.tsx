"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Video, VideoOff, Mic, MicOff, Settings, CheckCircle, AlertCircle, Clock, Shield, Users } from "lucide-react"

interface WaitingRoomProps {
  onJoinCall: () => void
  userName: string
  roomId: string
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({ onJoinCall, userName, roomId }) => {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [deviceStatus, setDeviceStatus] = useState<{
    camera: "checking" | "available" | "denied" | "unavailable"
    microphone: "checking" | "available" | "denied" | "unavailable"
  }>({
    camera: "checking",
    microphone: "checking",
  })

  const videoRef = React.useRef<HTMLVideoElement>(null)

  useEffect(() => {
    checkDevices()
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const checkDevices = async () => {
    try {
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      setStream(testStream)
      setDeviceStatus({
        camera: "available",
        microphone: "available",
      })
    } catch (error) {
      console.error("Device access error:", error)

      // Check individual permissions
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
        videoStream.getTracks().forEach((track) => track.stop())
        setDeviceStatus((prev) => ({ ...prev, camera: "available" }))
      } catch {
        setDeviceStatus((prev) => ({ ...prev, camera: "denied" }))
      }

      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioStream.getTracks().forEach((track) => track.stop())
        setDeviceStatus((prev) => ({ ...prev, microphone: "available" }))
      } catch {
        setDeviceStatus((prev) => ({ ...prev, microphone: "denied" }))
      }
    }
  }

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled
        setIsVideoEnabled(!isVideoEnabled)
      }
    }
  }

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled
        setIsAudioEnabled(!isAudioEnabled)
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "denied":
      case "unavailable":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-orange-500 animate-spin" />
    }
  }

  const canJoinCall = deviceStatus.camera === "available" || deviceStatus.microphone === "available"

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-white flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Video Preview */}
        <Card className="p-6 lg:p-8 bg-white/80 backdrop-blur-sm border-2 border-orange-100 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
              <Video className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Camera Preview</h2>
              <p className="text-sm text-gray-600">Test your setup before joining</p>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden aspect-video mb-6 border-2 border-orange-200">
            {stream && isVideoEnabled ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-orange-800">{userName.charAt(0).toUpperCase()}</span>
                  </div>
                  <VideoOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-75">Camera off</p>
                </div>
              </div>
            )}

            {/* Audio indicator */}
            {stream && (
              <div className="absolute top-4 right-4">
                {isAudioEnabled ? (
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Mic className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <MicOff className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={toggleVideo}
              variant={isVideoEnabled ? "default" : "destructive"}
              size="lg"
              className={`rounded-full w-14 h-14 p-0 transition-all duration-200 ${
                isVideoEnabled ? "bg-orange-500 hover:bg-orange-600 shadow-lg" : "bg-red-500 hover:bg-red-600 shadow-lg"
              }`}
              disabled={deviceStatus.camera !== "available"}
            >
              {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>

            <Button
              onClick={toggleAudio}
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              className={`rounded-full w-14 h-14 p-0 transition-all duration-200 ${
                isAudioEnabled ? "bg-orange-500 hover:bg-orange-600 shadow-lg" : "bg-red-500 hover:bg-red-600 shadow-lg"
              }`}
              disabled={deviceStatus.microphone !== "available"}
            >
              {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>
          </div>
        </Card>

        {/* Setup & Join */}
        <Card className="p-6 lg:p-8 bg-white/80 backdrop-blur-sm border-2 border-orange-100 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ready to Join?</h2>
              <p className="text-sm text-gray-600">Room: {roomId}</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-25 rounded-xl border border-orange-200">
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">Camera</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(deviceStatus.camera)}
                <span className="text-sm font-medium capitalize">{deviceStatus.camera}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-25 rounded-xl border border-orange-200">
              <div className="flex items-center gap-3">
                <Mic className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">Microphone</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(deviceStatus.microphone)}
                <span className="text-sm font-medium capitalize">{deviceStatus.microphone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-25 rounded-xl border border-orange-200">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">Joining as</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{userName}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-25 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Security</span>
              </div>
              <span className="text-sm font-medium text-green-700">End-to-end encrypted</span>
            </div>
          </div>

          {!canJoinCall && (
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-25 border-2 border-yellow-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-yellow-800 mb-2">Device Access Required</h3>
                  <p className="text-sm text-yellow-700 mb-4">
                    Please allow access to your camera and/or microphone to join the consultation.
                  </p>
                  <Button
                    onClick={checkDevices}
                    variant="outline"
                    size="sm"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  >
                    Check Again
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={onJoinCall}
            disabled={!canJoinCall}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 text-lg shadow-lg transition-all duration-200"
            size="lg"
          >
            Join Medical Consultation
          </Button>

          <p className="text-xs text-gray-500 mt-4 text-center leading-relaxed">
            This is a secure, HIPAA-compliant video call platform. Your consultation is private and encrypted.
          </p>
        </Card>
      </div>
    </div>
  )
}
