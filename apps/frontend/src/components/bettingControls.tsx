'use client'
import { BettingControlData } from '@/interfaces/bettingControlData'
import { useCallback } from 'react'
import { useToast } from './ui/use-toast'

export default function BettingControls({
  setBetAmount,
  socket,
  betAmount,
  gameId,
  balance,
  running,
  betId,
  crashed,
  multiplier,
  user
}: BettingControlData) {
  const { toast } = useToast()
  /**
   * Functinon to handle the change of the bet amount
   */
  const handleBetChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setBetAmount(parseInt(e.target.value))
    },
    [setBetAmount]
  )
  /**
   * Function to place a bet
   * If the bet amount is greater than the balance, the function will show a toast and return
   * The button is disabled if the game is not running, or if the player has already placed a bet.
   */
  const placeBet = useCallback((): void => {
    if (betAmount > balance) {
      toast({
        variant: 'destructive',
        title: 'Can not place bet!',
        description: 'You do not have enough balance to place this bet'
      })
      return
    }
    socket.emit('placeBet', { betAmount, gameId })
  }, [socket, betAmount, gameId, balance, toast])

  /**
   * Function to take profit
   * This function will emit a socket event to take profit.
   * The button is disabled if there is no active bet or if the game has crashed, so it is only possible to take profit if the game is running and there is an active bet.
   */
  const takeProfit = useCallback((): void => {
    socket.emit('takeProfit', { betId, multiplier })
  }, [socket, betId, multiplier])

  return (
    <div className='flex'>
      <p className='my-3'>Amount: </p>
      <input
        type='number'
        min={0}
        max={balance}
        className='text-black h-8 w-24 border-2 border-black rounded-md mx-2 my-2'
        onChange={handleBetChange}
      />
      <button
        className={`text-white ${betId !== 'no active bet' || running ? 'bg-slate-500' : 'bg-green-800'} rounded-md mx-2 h-8 w-24 my-2`}
        onClick={placeBet}
        disabled={betId !== 'no active bet' || running}
      >
        Place bet
      </button>
      <button
        className={`text-white ${betId === 'no active bet' || crashed ? 'bg-slate-500' : 'bg-green-800'} rounded-md mx-2 h-8 w-24 my-2`}
        onClick={takeProfit}
        disabled={betId === 'no active bet'}
      >
        Take Profit
      </button>
      <p className='my-3'>{`Your balance: ${balance.toFixed(2)}$`}</p>
    </div>
  )
}
