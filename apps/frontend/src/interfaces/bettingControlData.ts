import { Socket } from 'socket.io-client'

export interface BettingControlData {
  setBetAmount: (amount: number) => void
  socket: Socket
  betAmount: number
  gameId: number
  betId: number | 'no active bet'
  user: any
  balance: number
  running: boolean
  crashed: boolean
  multiplier: number
}
