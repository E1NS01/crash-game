import { Socket } from 'socket.io-client'

export interface UseGameSocketEventsProps {
  socket: Socket
  setPlayerCount: React.Dispatch<React.SetStateAction<number>>
  setCrashed: React.Dispatch<React.SetStateAction<boolean>>
  setRunning: React.Dispatch<React.SetStateAction<boolean>>
  setMultiplier: React.Dispatch<React.SetStateAction<number>>
  setLastResults: React.Dispatch<
    React.SetStateAction<Array<{ value: number; hash: string }>>
  >
  setGameId: React.Dispatch<React.SetStateAction<number>>
  setBetId: React.Dispatch<React.SetStateAction<number | 'no active bet'>>
  setRotation: React.Dispatch<React.SetStateAction<number>>
  setXPosition: React.Dispatch<React.SetStateAction<number>>
  setYPosition: React.Dispatch<React.SetStateAction<number>>
  setBackgroundX: React.Dispatch<React.SetStateAction<number>>
  setBackgroundY: React.Dispatch<React.SetStateAction<number>>
  setThrusterLength: React.Dispatch<React.SetStateAction<number>>
  setRotationFinal: React.Dispatch<React.SetStateAction<boolean>>
  updateUserAndBalance: () => void
  toast: (props: {
    variant?: 'default' | 'destructive'
    title: string
    description: string
  }) => void
}
