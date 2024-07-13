import { UseGameSocketEventsProps } from '@/interfaces/useGameSocketEventsProps'
import { useEffect, useRef } from 'react'
import { Socket } from 'socket.io-client'

/**
 * useGameSocket
 *
 * @description Custom hook for handling game socket events
 *
 * This hook listens to the game socket events and updates the game state accoring to the events.
 * It handles the following events:
 * - connectedClients - updates the player count
 * - multiUpdate - updates the multiplier
 * - crash  - updates the multiplier and sets the game to crashed
 * - newGame  - updates the game id and resets the rocket position
 * - betPlaced  - updates the bet id and balance and shows a toast message
 * - profitTaken  - shows a toast message and updates the bet id and balance
 *
 *
 * @param socket
 * @param setPlayerCount
 * @param setCrashed
 * @param setRunning
 * @param setMultiplier
 * @param setLastResults
 * @param setGameId
 * @param setBetId
 * @param setRotation
 * @param setXPosition
 * @param setYPosition
 * @param setBackgroundX
 * @param setBackgroundY
 * @param setRotationFinal
 * @param updateUserAndBalance
 * @param toast
 */
export function useGameSocket({
  socket,
  setPlayerCount,
  setCrashed,
  setRunning,
  setMultiplier,
  setLastResults,
  setGameId,
  setBetId,
  setRotation,
  setXPosition,
  setYPosition,
  setBackgroundX,
  setBackgroundY,
  setRotationFinal,
  updateUserAndBalance,
  toast
}: UseGameSocketEventsProps) {
  const updatedResultsRef = useRef(false)

  useEffect(() => {
    socket.on('connectedClients', (connectedClients: number) => {
      setPlayerCount(connectedClients)
    })

    socket.on('multiUpdate', (value: number) => {
      setCrashed(false)
      setRunning(true)
      setMultiplier(value)
    })

    socket.on('crash', (value: number, hash: string) => {
      if (!updatedResultsRef.current) {
        setLastResults((currentResults) => {
          return [...currentResults, { value, hash }].slice(-10)
        })
        updatedResultsRef.current = true
      }
      setMultiplier(value)
      setCrashed(true)
      setRunning(false)
    })

    socket.on('newGame', (newGameId: number) => {
      setGameId(newGameId)
      setBetId('no active bet')

      setTimeout(() => {
        setRotation(1.5)
        setXPosition(200)
        setYPosition(500)
        setBackgroundX(0)
        setBackgroundY(-2500)
        setRotationFinal(false)
        updatedResultsRef.current = false
      }, 5000)
    })

    socket.on(
      'betPlaced',
      (data: { error?: string; amount?: number; id?: number }) => {
        if (data.error) {
          toast({
            variant: 'destructive',
            title: 'Can not place bet!',
            description: data.error
          })
          return
        }
        toast({
          variant: 'default',
          title: 'Bet placed!',
          description: `Bet placed with amount: ${data.amount}`
        })
        updateUserAndBalance()
        setBetId(data.id!)
      }
    )

    socket.on(
      'profitTaken',
      (data: { error?: string; amount?: number }, betMultiplier: number) => {
        if (data.error) {
          toast({
            variant: 'destructive',
            title: 'Can not take profit!',
            description: data.error
          })
        } else {
          toast({
            title: 'Profit taken!',
            description: `Profit taken with amount: ${(data.amount! * betMultiplier).toFixed(2)}`
          })
          setBetId('no active bet')
          updateUserAndBalance()
        }
      }
    )

    return () => {
      socket.off('connectedClients')
      socket.off('multiUpdate')
      socket.off('crash')
      socket.off('newGame')
      socket.off('betPlaced')
      socket.off('profitTaken')
    }
  }, [
    socket,
    updateUserAndBalance,
    toast,
    setPlayerCount,
    setCrashed,
    setRunning,
    setMultiplier,
    setLastResults,
    setGameId,
    setBetId,
    setRotation,
    setXPosition,
    setYPosition,
    setBackgroundX,
    setBackgroundY,
    setRotationFinal
  ])
}
