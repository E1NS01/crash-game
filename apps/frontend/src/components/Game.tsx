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
import {
  animationSpeed,
  movementSpeed,
  rotationSpeed,
  thrustGrowth,
} from '@/app/constants/animationConstants'
import { useToast } from './ui/use-toast'

export default function Pixi() {
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
  const [xPosition, setXPosition] = useState<number>(300)
  const [yPosition, setYPosition] = useState<number>(500)
  const [thrusterLength, setThrusterLength] = useState<number>(0.01)

  const scene = process.env.NEXT_PUBLIC_URL + '/planet.jpg'
  const updatedResultsRef = useRef(false)
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
  /**
   * Sets up the socket listeners
   *
   * This function sets up the socket listeners for the following events:
   * - connectedClients (updates the live player count)
   * - multiUpdate (updates the game multiplier)
   * - crash (updates the game multiplier and sets the game state to crashed)
   * - newGame (updates the game id and resets the rocket position and rotation)
   * - betPlaced (updates the user balance and sets the bet id)
   * - profitTaken (updates the user balance and sets the bet id to 'no active bet')
   */
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
          return [...currentResults, { value, hash }].splice(-10)
        })
        updatedResultsRef.current = true
      }
      setMultiplier(value)
      setCrashed(true)
      setRunning(false)
    })
    socket.on('newGame', (newGameId) => {
      setGameId(newGameId)
      setBetId('no active bet')

      setTimeout(() => {
        setRotation(1.5)
        setXPosition(300)
        setYPosition(500)
        setThrusterLength(0.01)
        setRotationFinal(false)
        updatedResultsRef.current = false
      }, 5000)
    })
    socket.on('betPlaced', (data) => {
      if (data.error) {
        toast({
          variant: 'destructive',
          title: 'Can not place bet!',
          description: data.error,
        })
        return
      }
      toast({
        variant: 'default',
        title: 'Bet placed!',
        description: `Bet placed with amount: ${data.amount}`,
      })
      updateUserAndBalance()
      setBetId(data.id)
    })
    socket.on('profitTaken', (data, betMultiplier) => {
      if (data.error) {
        toast({
          variant: 'destructive',
          title: 'Can not take profit!',
          description: data.error,
        })
      }
      toast({
        title: 'Profit taken!',
        description: `Profit taken with amount: ${(data.amount * betMultiplier).toFixed(2)}`,
      })
      setBetId('no active bet')
      updateUserAndBalance()
    })
  }, [socket, updateUserAndBalance, toast])

  /**
   * Animates the rocket
   *
   * This useEffect animates the rocket by updating the x and y position of the rocket.
   * Once the rocket reaches the final position, it will start to grow the thruster.
   *
   * cancelAnimationFrame is used to stop the animation when the component is unmounted.
   */
  useEffect(() => {
    let animationFrameId: number

    const rotateSprite = () => {
      if (!rotationFinal) {
        setXPosition((currentXPosition) => currentXPosition + movementSpeed)
        setYPosition((currentYPosition) => currentYPosition - movementSpeed)
        animationFrameId = requestAnimationFrame(rotateSprite)
      }
      if (rotationFinal && thrusterLength <= 0.4) {
        setThrusterLength(
          (currentThrusterLength) => (currentThrusterLength += thrustGrowth)
        )
      }
    }

    if (running) {
      animationFrameId = requestAnimationFrame(rotateSprite)
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [running, rotationFinal, thrusterLength])

  /**
   * Animates the rocket rotation
   *
   * This useEffect animates the rotation of the rocket by updating the rotation value.
   * It updates the rotation value according to the rotationSpeed and animationSpeed (currently for 60 frames per second).
   */
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    function animate(): void {
      setRotation((currentRotation) => {
        if (currentRotation <= 0.05) {
          setRotationFinal(true)
          return currentRotation
        }
        return currentRotation - rotationSpeed
      })
      timeoutId = setTimeout(animate, animationSpeed)
    }

    if (running) {
      animate()
    } else if (timeoutId) {
      clearTimeout(timeoutId)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [running])

  return (
    <>
      <div className='flex flex-col items-center justify-center w-screen mt-12'>
        <Stage width={800} height={600} options={{ background: 0x1099bb }}>
          <Sprite image={scene} height={600} width={800} alpha={0.8} />

          <RocketSprite
            crashed={crashed}
            xPosition={xPosition}
            yPosition={yPosition}
            rotation={rotation}
            rotationFinal={rotationFinal}
            thrusterLength={thrusterLength}
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
