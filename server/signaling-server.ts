import WebSocket, { WebSocketServer } from "ws"
import http, { IncomingMessage, ServerResponse } from "http"
import { parse as parseUrl } from "url"

// ---------------- Interfaces & Types ----------------

interface Participant {
  userName: string
  ws: WebSocket
  joinedAt: number
}

interface RoomMessage {
  type: string
  userId?: string
  userName?: string
  targetUserId?: string
  [key: string]: any
}

// ---------------- Room Class ----------------

class Room {
  id: string
  participants: Map<string, Participant>
  createdAt: number

  constructor(id: string) {
    this.id = id
    this.participants = new Map()
    this.createdAt = Date.now()
  }

  addParticipant(userId: string, userName: string, ws: WebSocket): void {
    if (this.participants.has(userId)) {
      this.removeParticipant(userId)
    }

    this.participants.set(userId, { userName, ws, joinedAt: Date.now() })

    this.broadcast(
      {
        type: "user-joined",
        userId,
        userName,
        timestamp: Date.now(),
      },
      userId,
    )

    console.log(`User ${userName} (${userId}) joined room ${this.id}. Total participants: ${this.participants.size}`)

    const currentParticipants = Array.from(this.participants.entries())
      .filter(([id]) => id !== userId)
      .map(([id, data]) => ({ userId: id, userName: data.userName }))

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "room-state",
          participants: currentParticipants,
          timestamp: Date.now(),
        }),
      )
    }
  }

  removeParticipant(userId: string): void {
    const participant = this.participants.get(userId)
    if (participant) {
      if (participant.ws.readyState === WebSocket.OPEN) {
        participant.ws.close()
      }

      this.participants.delete(userId)

      this.broadcast({
        type: "user-left",
        userId,
        timestamp: Date.now(),
      })

      console.log(`User ${participant.userName} (${userId}) left room ${this.id}. Remaining: ${this.participants.size}`)
    }

    if (this.participants.size === 0) {
      setTimeout(() => {
        if (this.participants.size === 0) {
          rooms.delete(this.id)
          console.log(`Room ${this.id} deleted (empty)`)
        }
      }, 5 * 60 * 1000)
    }
  }

  broadcast(message: object, excludeUserId: string | null = null): number {
    let sentCount = 0
    this.participants.forEach((participant, userId) => {
      if (userId !== excludeUserId && participant.ws.readyState === WebSocket.OPEN) {
        try {
          participant.ws.send(JSON.stringify(message))
          sentCount++
        } catch (error) {
          console.error(`Failed to send message to ${userId}:`, error)
          this.removeParticipant(userId)
        }
      }
    })
    return sentCount
  }

  forwardMessage(message: RoomMessage, targetUserId: string): boolean {
    const target = this.participants.get(targetUserId)
    if (target && target.ws.readyState === WebSocket.OPEN) {
      try {
        target.ws.send(JSON.stringify(message))
        return true
      } catch (error) {
        console.error(`Failed to forward message to ${targetUserId}:`, error)
        this.removeParticipant(targetUserId)
      }
    }
    return false
  }

  getParticipant(userId: string): Participant | undefined {
    return this.participants.get(userId)
  }
}

// ---------------- Server Setup ----------------

const rooms = new Map<string, Room>()

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req.method === "OPTIONS") {
    res.writeHead(200)
    res.end()
    return
  }

  res.writeHead(200, { "Content-Type": "text/plain" })
  res.end("WebRTC Signaling Server is running")
})

const wss = new WebSocketServer({
  server,
  perMessageDeflate: false,
  clientTracking: true,
})

wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
  const query = parseUrl(req.url || "", true).query
  const roomId = query.roomId as string
  const userId = query.userId as string
  const userName = decodeURIComponent((query.userName as string) || "Anonymous")

  if (!roomId || !userId) {
    console.log("Connection rejected: Missing roomId or userId")
    ws.close(1008, "Missing roomId or userId")
    return
  }

  let room = rooms.get(roomId)
  if (!room) {
    room = new Room(roomId)
    rooms.set(roomId, room)
    console.log(`Room ${roomId} created`)
  }

  room.addParticipant(userId, userName, ws)

  ws.send(
    JSON.stringify({
      type: "connected",
      roomId,
      userId,
      timestamp: Date.now(),
    }),
  )

  ws.on("message", (data: WebSocket.RawData) => {
    try {
      const message: RoomMessage = JSON.parse(data.toString())

      switch (message.type) {
        case "join-room":
          break
        case "offer":
        case "answer":
        case "ice-candidate":
          if (message.targetUserId) {
            const success = room!.forwardMessage(
              {
                ...message,
                userId,
                userName,
                timestamp: Date.now(),
              },
              message.targetUserId,
            )

            if (!success) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: `Failed to deliver message to ${message.targetUserId}`,
                  timestamp: Date.now(),
                }),
              )
            }
          }
          break
        case "ping":
          ws.send(
            JSON.stringify({
              type: "pong",
              timestamp: Date.now(),
            }),
          )
          break
        default:
          console.warn("Unknown message type:", message.type)
      }
    } catch (error) {
      console.error("Error parsing message:", error)
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
          timestamp: Date.now(),
        }),
      )
    }
  })

  ws.on("close", (code: number, reason: Buffer) => {
    console.log(`Connection closed: ${userId} (${code}: ${reason.toString()})`)
    room!.removeParticipant(userId)
  })

  ws.on("error", (error) => {
    console.error("WebSocket error:", error)
    room!.removeParticipant(userId)
  })

  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping()
    } else {
      clearInterval(pingInterval)
    }
  }, 30000)

  ws.on("close", () => {
    clearInterval(pingInterval)
  })
})

// ---------------- Health Check ----------------

server.on("request", (req: IncomingMessage, res: ServerResponse) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(
      JSON.stringify({
        status: "healthy",
        rooms: rooms.size,
        totalParticipants: Array.from(rooms.values()).reduce((sum, r) => sum + r.participants.size, 0),
        timestamp: Date.now(),
      }),
    )
  }
})

// ---------------- Startup & Shutdown ----------------

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`WebRTC Signaling server running on port ${PORT}`)
  console.log(`Health check available at http://localhost:${PORT}/health`)
})

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)

function shutdown() {
  console.log("Shutting down signaling server...")
  wss.close(() => {
    server.close(() => {
      process.exit(0)
    })
  })
}

// ---------------- Cleanup ----------------

setInterval(() => {
  const now = Date.now()
  const oneHour = 60 * 60 * 1000

  rooms.forEach((room, roomId) => {
    if (room.participants.size === 0 && now - room.createdAt > oneHour) {
      rooms.delete(roomId)
      console.log(`Cleaned up old empty room: ${roomId}`)
    }
  })
}, 10 * 60 * 1000)
