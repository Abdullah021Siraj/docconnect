export interface PeerConnection {
  id: string
  name: string
  connection: RTCPeerConnection
  stream?: MediaStream
}

export interface MediaConstraints {
  video: boolean
  audio: boolean
}

export class WebRTCManager {
  private localStream: MediaStream | null = null
  private peers: Map<string, PeerConnection> = new Map()
  private socket: WebSocket | null = null
  private roomId: string
  private userId: string
  private userName: string
  private onStreamAdded?: (peerId: string, stream: MediaStream, name: string) => void
  private onStreamRemoved?: (peerId: string) => void
  private onConnectionStateChange?: (peerId: string, state: RTCPeerConnectionState) => void
  private onChatMessage?: (messageData: any) => void
  private cleanupLocalStorage?: () => void

  private iceServers = [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }]

  constructor(
    roomId: string,
    userId: string,
    userName: string,
    callbacks: {
      onStreamAdded?: (peerId: string, stream: MediaStream, name: string) => void
      onStreamRemoved?: (peerId: string) => void
      onConnectionStateChange?: (peerId: string, state: RTCPeerConnectionState) => void
      onChatMessage?: (messageData: any) => void
    },
  ) {
    this.roomId = roomId
    this.userId = userId
    this.userName = userName
    this.onStreamAdded = callbacks.onStreamAdded
    this.onStreamRemoved = callbacks.onStreamRemoved
    this.onConnectionStateChange = callbacks.onConnectionStateChange
    this.onChatMessage = callbacks.onChatMessage
  }

  async initializeMedia(constraints: MediaConstraints = { video: true, audio: true }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      return this.localStream
    } catch (error) {
      console.error("Error accessing media devices:", error)
      throw error
    }
  }

  async connectToRoom() {
    // First try to connect to WebSocket server
    const wsUrl = `ws://localhost:3001/ws?roomId=${this.roomId}&userId=${this.userId}&userName=${encodeURIComponent(this.userName)}`

    try {
      this.socket = new WebSocket(wsUrl)

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
          console.log("WebSocket connection timeout, falling back to localStorage")
          this.socket.close()
          this.setupLocalStorageSignaling()
        }
      }, 3000)

      this.socket.onopen = () => {
        clearTimeout(connectionTimeout)
        console.log("Connected to signaling server")
        this.joinRoom()
      }

      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data)
        this.handleSignalingMessage(message)
      }

      this.socket.onclose = (event) => {
        clearTimeout(connectionTimeout)
        console.log("Disconnected from signaling server, using localStorage fallback")
        this.setupLocalStorageSignaling()
      }

      this.socket.onerror = (error) => {
        clearTimeout(connectionTimeout)
        console.log("WebSocket connection failed, using localStorage fallback")
        this.setupLocalStorageSignaling()
      }
    } catch (error) {
      console.log("WebSocket not available, using localStorage fallback")
      this.setupLocalStorageSignaling()
    }
  }

  private setupLocalStorageSignaling() {
    console.log("Using localStorage signaling for cross-tab communication")

    // Close WebSocket if it exists
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    // Listen for messages from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === `webrtc-signal-${this.roomId}` && event.newValue) {
        try {
          const message = JSON.parse(event.newValue)
          if (message.targetUserId === this.userId || !message.targetUserId) {
            this.handleSignalingMessage(message)
          }
        } catch (error) {
          console.error("Error parsing localStorage message:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Store cleanup function
    this.cleanupLocalStorage = () => {
      window.removeEventListener("storage", handleStorageChange)
    }

    // Announce presence to other tabs
    setTimeout(() => {
      this.broadcastLocalMessage({
        type: "user-joined",
        userId: this.userId,
        userName: this.userName,
      })
    }, 100)
  }

  private broadcastLocalMessage(message: any) {
    const messageWithTimestamp = {
      ...message,
      timestamp: Date.now(),
      roomId: this.roomId,
    }

    // Use a unique key for each room
    localStorage.setItem(`webrtc-signal-${this.roomId}`, JSON.stringify(messageWithTimestamp))

    // Clear after a short delay to allow other tabs to read
    setTimeout(() => {
      const currentMessage = localStorage.getItem(`webrtc-signal-${this.roomId}`)
      if (currentMessage) {
        const parsed = JSON.parse(currentMessage)
        if (parsed.timestamp === messageWithTimestamp.timestamp) {
          localStorage.removeItem(`webrtc-signal-${this.roomId}`)
        }
      }
    }, 500)
  }

  private joinRoom() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.sendSignalingMessage({
        type: "join-room",
        roomId: this.roomId,
        userId: this.userId,
        userName: this.userName,
      })
    }
  }

  private async handleSignalingMessage(message: any) {
    switch (message.type) {
      case "user-joined":
        await this.handleUserJoined(message.userId, message.userName)
        break
      case "user-left":
        this.handleUserLeft(message.userId)
        break
      case "offer":
        await this.handleOffer(message.userId, message.userName, message.offer)
        break
      case "answer":
        await this.handleAnswer(message.userId, message.answer)
        break
      case "ice-candidate":
        await this.handleIceCandidate(message.userId, message.candidate)
        break
      case "chat-message":
        if (this.onChatMessage && message.userId !== this.userId) {
          this.onChatMessage(message.messageData)
        }
        break
    }
  }

  sendChatMessage(messageData: any) {
    this.sendSignalingMessage({
      type: "chat-message",
      messageData,
      userId: this.userId,
      userName: this.userName,
    })
  }

  private sendSignalingMessage(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
    } else {
      // Fallback to localStorage for testing
      this.broadcastLocalMessage(message)
    }
  }

  private async createPeerConnection(peerId: string, name: string): Promise<RTCPeerConnection> {
    const peerConnection = new RTCPeerConnection({ iceServers: this.iceServers })

    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!)
      })
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams
      if (this.onStreamAdded) {
        this.onStreamAdded(peerId, remoteStream, name)
      }
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.sendSignalingMessage({
          type: "ice-candidate",
          targetUserId: peerId,
          candidate: event.candidate,
        })
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(peerId, peerConnection.connectionState)
      }

      if (peerConnection.connectionState === "disconnected" || peerConnection.connectionState === "failed") {
        this.removePeer(peerId)
      }
    }

    return peerConnection
  }

  private async handleUserJoined(userId: string, userName: string) {
    if (userId === this.userId) return

    const peerConnection = await this.createPeerConnection(userId, userName)
    this.peers.set(userId, { id: userId, name: userName, connection: peerConnection })

    // Create and send offer
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    if (this.socket) {
      this.sendSignalingMessage({
        type: "offer",
        targetUserId: userId,
        offer: offer,
      })
    }
  }

  private async handleOffer(userId: string, userName: string, offer: RTCSessionDescriptionInit) {
    const peerConnection = await this.createPeerConnection(userId, userName)
    this.peers.set(userId, { id: userId, name: userName, connection: peerConnection })

    await peerConnection.setRemoteDescription(offer)
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    if (this.socket) {
      this.sendSignalingMessage({
        type: "answer",
        targetUserId: userId,
        answer: answer,
      })
    }
  }

  private async handleAnswer(userId: string, answer: RTCSessionDescriptionInit) {
    const peer = this.peers.get(userId)
    if (peer) {
      await peer.connection.setRemoteDescription(answer)
    }
  }

  private async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit) {
    const peer = this.peers.get(userId)
    if (peer) {
      await peer.connection.addIceCandidate(candidate)
    }
  }

  private handleUserLeft(userId: string) {
    this.removePeer(userId)
  }

  private removePeer(peerId: string) {
    const peer = this.peers.get(peerId)
    if (peer) {
      peer.connection.close()
      this.peers.delete(peerId)
      if (this.onStreamRemoved) {
        this.onStreamRemoved(peerId)
      }
    }
  }

  async toggleVideo(enabled: boolean) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = enabled
      }
    }
  }

  async toggleAudio(enabled: boolean) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = enabled
      }
    }
  }

  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })

      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0]

      this.peers.forEach((peer) => {
        const sender = peer.connection.getSenders().find((s) => s.track && s.track.kind === "video")
        if (sender) {
          sender.replaceTrack(videoTrack)
        }
      })

      // Handle screen share end
      videoTrack.onended = () => {
        this.stopScreenShare()
      }

      return screenStream
    } catch (error) {
      console.error("Error starting screen share:", error)
      throw error
    }
  }

  async stopScreenShare() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]

      this.peers.forEach((peer) => {
        const sender = peer.connection.getSenders().find((s) => s.track && s.track.kind === "video")
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack)
        }
      })
    }
  }

  leaveRoom() {
    // Announce leaving
    this.broadcastLocalMessage({
      type: "user-left",
      userId: this.userId,
    })

    // Close all peer connections
    this.peers.forEach((peer) => {
      peer.connection.close()
    })
    this.peers.clear()

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }

    // Close WebSocket connection
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    // Cleanup localStorage listeners
    if (this.cleanupLocalStorage) {
      this.cleanupLocalStorage()
    }
  }

  getLocalStream() {
    return this.localStream
  }

  getPeers() {
    return Array.from(this.peers.values())
  }
}
