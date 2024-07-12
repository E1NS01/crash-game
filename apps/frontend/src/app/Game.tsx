'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Sprite, Stage, Text } from '@pixi/react'
import { TextStyle } from '@pixi/text'
import { Texture } from '@pixi/core'
import { initSocket } from '@/helper/socketio'
import { getUserById } from '@/helper/apiCalls'
import useSound from 'use-sound'

export default function Pixi() {
  const [rotation, setRotation] = useState<number>(1.5)
  const [rotationFinal, setRotationFinal] = useState<boolean>(false)
  const [multiplier, setMultiplier] = useState<number>(1)
  const [xPosition, setXPosition] = useState<number>(300)
  const [yPosition, setYPosition] = useState<number>(500)
  const [thrusterLength, setThrusterLength] = useState<number>(0.01)
  const [lastResults, setLastResults] = useState<any[]>([])
  const [playerCount, setPlayerCount] = useState<number>(0)
  const [running, setRunning] = useState<boolean>(false)
  const [crashed, setCrashed] = useState<boolean>(true)
  const [betAmount, setBetAmount] = useState<number>(0)
  const [balance, setBalance] = useState<number>(0)
  const [betId, setBetId] = useState<number | 'no active bet'>('no active bet')
  const [gameId, setGameId] = useState<number>(0)
  const [user, setUser] = useState<any>({})
  // const [audioEnabled, setAudioEnabled] = useState<boolean>(false)

  const rocket = process.env.NEXT_PUBLIC_URL + '/3drocket.png'
  const scene = process.env.NEXT_PUBLIC_URL + '/planet.jpg'
  const explosion = process.env.NEXT_PUBLIC_URL + '/explode-small.png'
  const engine = process.env.NEXT_PUBLIC_URL + '/engine.png'
  /*   const audioOff = process.env.NEXT_PUBLIC_URL + '/audio-off.png'
  const audioOn = process.env.NEXT_PUBLIC_URL + '/audio-on.png' */
  const newGameStyle = new TextStyle({ fontSize: 40, fill: 'black' })
  const multiplierStyle = new TextStyle({ fontSize: 40, fill: 'white' })
  const playerCounterStyle = new TextStyle({ fontSize: 20, fill: 'white' })
  const gameDataStyle = new TextStyle({ fontSize: 10, fill: 'white' })

  /* const [play] = useSound(
    process.env.NEXT_PUBLIC_URL + '/explosion-sound.mp3',
    {
      volume: 0.3,
      playbackRate: 1.25,
    }
  ) */
  const updatedResultsRef = useRef(false)
  const socket = useMemo(() => initSocket(), [])

  const handleBetChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setBetAmount(parseInt(e.target.value))
    },
    []
  )
  const updateBalance = useCallback(async (): Promise<void> => {
    const user = await getUserById(1)
    setBalance(user.balance)
  }, [])

  const takeProfit = useCallback((): void => {
    socket.emit('takeProfit', { betId, multiplier })
  }, [socket, betId, multiplier])

  const placeBet = useCallback((): void => {
    if (betAmount > balance) {
      return
    }
    socket.emit('placeBet', { betAmount, gameId })
  }, [socket, betAmount, gameId, balance])

  /* const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => !prev)
  }, []) */

  useEffect(() => {
    async function getUserId() {
      const user = await getUserById(1)
      setUser(user)
      setBalance(user.balance)
    }
    getUserId()
  }, [])

  useEffect(() => {
    socket.emit('getConnectedClients')
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
        //play()
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
    socket.on('betPlaced', (newBet) => {
      updateBalance()
      setBetId(newBet.id)
    })
    socket.on('profitTaken', (data) => {
      setBetId('no active bet')
      updateBalance()
    })
  }, [socket, updateBalance /* , play */])

  useEffect(() => {
    let animationFrameId: number

    const rotateSprite = () => {
      if (!rotationFinal) {
        setXPosition((currentXPosition) => currentXPosition + 0.33)
        setYPosition((currentYPosition) => currentYPosition - 0.33)
        animationFrameId = requestAnimationFrame(rotateSprite)
      }
      if (rotationFinal && thrusterLength <= 0.4) {
        setThrusterLength(
          (currentThrusterLength) => (currentThrusterLength += 0.001)
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
  }, [running, rotationFinal, yPosition, thrusterLength])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    function animate(): void {
      setRotation((currentRotation) => {
        if (currentRotation <= 0.05) {
          setRotationFinal(true)
          return currentRotation
        }
        return currentRotation - 0.003
      })
      timeoutId = setTimeout(animate, 1000 / 60) //60fps
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

  const rocketSprite = useMemo(() => {
    const pivot = { x: 179, y: 200 }
    return (
      <Sprite
        image={crashed ? explosion : rocket}
        x={xPosition}
        y={yPosition}
        scale={{ x: 0.5, y: 0.5 }}
        rotation={rotation}
        pivot={pivot}
      />
    )
  }, [crashed, rocket, explosion, xPosition, yPosition, rotation])

  /* const audioButtonSprite = useMemo(() => {
    return (
      <Sprite
        image={audioEnabled ? audioOn : audioOff}
        width={30}
        height={30}
        x={750}
        y={20}
        pointerdown={toggleAudio}
      />
    )
  }, [audioEnabled, toggleAudio, audioOff, audioOn]) */

  return (
    <>
      <div className='flex flex-col items-center justify-center w-screen mt-12'>
        <Stage width={800} height={600} options={{ background: 0x1099bb }}>
          <Sprite image={scene} height={600} width={800} alpha={0.8} />
          <Text text={`gameID: ${gameId}`} x={0} y={0} style={gameDataStyle} />
          <Text text={`betID: ${betId}`} x={80} y={0} style={gameDataStyle} />
          <Text text='Multiplier:' x={80} y={110} style={multiplierStyle} />
          <Text
            text={`${multiplier.toFixed(2)}x`}
            x={80}
            y={150}
            style={multiplierStyle}
          />
          {!crashed && rotationFinal && (
            <Sprite
              image={engine}
              x={679}
              y={145}
              scale={{ x: 0.4, y: thrusterLength }}
            />
          )}
          {rocketSprite}
          {/* {audioButtonSprite} */}
          <Text
            text={`Current Players: ${playerCount}`}
            y={570}
            x={610}
            style={playerCounterStyle}
          />
          {crashed && (
            <Sprite
              texture={Texture.WHITE}
              x={0}
              y={0}
              width={800}
              height={600}
              alpha={0.3}
            />
          )}
          {crashed && (
            <>
              <Text
                text={`Waiting for next round...`}
                x={180}
                y={200}
                style={newGameStyle}
              />
              <Text
                text={`Place your bets!`}
                x={230}
                y={275}
                style={newGameStyle}
              />
            </>
          )}
        </Stage>
        <div className=''>
          <div className='flex'>
            <p>Last results: </p>
            {lastResults.map((result, index) => (
              <p
                key={index}
                className={
                  result.value > 2 ? 'px-2 text-green-500' : 'px-2 text-red-500'
                }
              >
                {result.value.toFixed(2)}
              </p>
            ))}
          </div>
          <div className='flex'>
            <p className='my-3'>Amount: </p>
            <input
              type='number'
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
        </div>
      </div>
    </>
  )
}
