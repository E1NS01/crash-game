'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Sprite, Stage } from '@pixi/react'
import { initSocket } from '@/helper/socketio'
import { getUserById } from '@/helper/apiCalls'
import RocketSprite from './rocketSprite'
import GameInfo from './gameInfo'
import CrashOverlay from './crashOverlay'
import LastResults from './lastResults'
import { LastResultsData } from '@/interfaces/lastResultsData'
import BettingControls from './bettingControls'
import { useToast } from './ui/use-toast'
import { useGameSocket } from '@/lib/useSocket'

export default function Game() {
  //game state
  const [multiplier, setMultiplier] = useState<number>(1)
  const [lastResults, setLastResults] = useState<LastResultsData[]>([])
  const [playerCount, setPlayerCount] = useState<number>(0)
  const [running, setRunning] = useState<boolean>(false)
  const [crashed, setCrashed] = useState<boolean>(true)
  const [betAmount, setBetAmount] = useState<number>(0)
  const [balance, setBalance] = useState<number>(0)
  const [betId, setBetId] = useState<number | 'no active bet'>('no active bet')
  const [gameId, setGameId] = useState<number>(0)
  const [user, setUser] = useState<any>({})
  //pixi.js
  const [rotation, setRotation] = useState<number>(1.5)
  const [rotationFinal, setRotationFinal] = useState<boolean>(false)
  const [xPosition, setXPosition] = useState<number>(200)
  const [yPosition, setYPosition] = useState<number>(500)
  const [backgroundX, setBackgroundX] = useState<number>(0)
  const [backgroundY, setBackgroundY] = useState<number>(-2500)

  const scene = process.env.NEXT_PUBLIC_URL + '/planet.jpg'
  const { toast } = useToast()
  const socket = useMemo(() => initSocket(), [])
  /**
   * Updates the user Object and sets the balance
   *
   * This function is called when the component is mounted, to make sure the user object is set.
   * Currently the user object is hardcoded to the user with the id 1.
   * This is due to the fact that there is no registration or login functionality implemented.
   *
   * @returns void
   */
  const updateUserAndBalance = useCallback(async (): Promise<void> => {
    const user = await getUserById(1)
    setBalance(user.balance)
    setUser(user)
  }, [])

  /**
   * Makes sure that the user object and the balance are set when the component is mounted.
   */
  useEffect(() => {
    updateUserAndBalance()
  }, [updateUserAndBalance])

  useGameSocket({
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
  })
  return (
    <>
      <div className='flex flex-col items-center justify-center w-screen mt-12'>
        <Stage width={800} height={600}>
          <Sprite
            image={scene}
            x={backgroundX}
            y={backgroundY}
            alpha={0.8}
            scale={{ x: 1, y: 1 }}
          />

          <RocketSprite
            backgroundX={backgroundX}
            crashed={crashed}
            running={running}
            xPosition={xPosition}
            yPosition={yPosition}
            setXPosition={setXPosition}
            setYPosition={setYPosition}
            rotation={rotation}
            rotationFinal={rotationFinal}
            setRotationFinal={setRotationFinal}
            setRotation={setRotation}
            setBackgroundX={setBackgroundX}
            setBackgroundY={setBackgroundY}
          />

          <GameInfo
            gameId={gameId}
            betId={betId}
            multiplier={multiplier}
            playerCount={playerCount}
          />
          {crashed && <CrashOverlay />}
        </Stage>
        <div className=''>
          <LastResults results={lastResults} />
          <BettingControls
            setBetAmount={setBetAmount}
            socket={socket}
            betAmount={betAmount}
            gameId={gameId}
            balance={balance}
            running={running}
            betId={betId}
            crashed={crashed}
            multiplier={multiplier}
            user={user}
          />
        </div>
      </div>
    </>
  )
}
