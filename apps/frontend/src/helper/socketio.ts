import { io, Socket } from 'socket.io-client'

let socket: Socket

export function initSocket() {
  if (!socket) {
    socket = io('http://localhost:3000')
    socket.on('connect', () => {
      console.log('Connected to server')
    })
  }
  return socket
}
