"use client"

import React, { useState } from "react"

import useUser from "@/src/hooks/useUser"
import { useRouter } from "next/navigation"
import { v4 as uuid } from "uuid"
import { WaitingRoom } from "./Waiting-Room"
import { VideoCall } from "./VideoCall"

interface RoomProps {
  roomid: string
}

const Room = ({ roomid }: RoomProps) => {
  const { fullName } = useUser()
  const router = useRouter()
  const [hasJoined, setHasJoined] = useState(false)

  const handleLeave = () => {
    router.push("/meeting")
  }

  const handleJoinCall = () => {
    setHasJoined(true)
  }

  // Generate a unique user ID for this session
  const userId = React.useMemo(() => uuid(), [])
  const userName = fullName || `User_${Date.now()}`

  if (!hasJoined) {
    return <WaitingRoom onJoinCall={handleJoinCall} userName={userName} roomId={roomid} />
  }

  return <VideoCall roomId={roomid} userId={userId} userName={userName} onLeave={handleLeave} />
}

export default Room
