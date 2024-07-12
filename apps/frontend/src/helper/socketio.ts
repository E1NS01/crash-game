import { io, Socket } from 'socket.io-client'

let socket: Socket

export function initSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL || 'https://localhost:3000')
    socket.on('connect', () => {
      console.log('Connected to server')
    })
    socket.on('disconnect', () => {
      console.log('Disconnected from server')
    })
  }
  return socket
}
