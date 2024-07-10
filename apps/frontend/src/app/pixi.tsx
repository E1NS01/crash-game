'use client'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { Sprite, Stage, Text } from '@pixi/react'
import { TextStyle } from '@pixi/text'
import { Texture } from '@pixi/core'
import { initSocket } from '@/helper/socketio'

//import useSound from 'use-sound' --uncomment for explosion sound effect

export default function Pixi() {
  const [rotation, setRotation] = useState<number>(1.5)
  const [rotationFinal, setRotationFinal] = useState<boolean>(false)
  const [multiplier, setMultiplier] = useState<number>(1)
  const [xPosition, setXPosition] = useState<number>(300)
  const [yPosition, setYPosition] = useState<number>(500)
  const [thrusterLength, setThrusterLength] = useState<number>(0.01)
  const [lastResults, setLastResults] = useState<any[]>([])
  const [playerCount, setPlayerCount] = useState<number>(0)
  const [crashValue, setCrashValue] = useState<number>(Infinity)
  const [lastHash, setLastHash] = useState<string>('')
  const [currentHash, setCurrentHash] = useState<string>('')
  const [running, setRunning] = useState<boolean>(false)
  const [crashed, setCrashed] = useState<boolean>(true)
  const [bet, setBet] = useState<number>(0)
  const [betAmount, setBetAmount] = useState<number>(0)
  const [balance, setBalance] = useState<number>(1000)
  const [betPlaced, setBetPlaced] = useState<boolean>(false)

  const rocket = 'http://localhost:8080/3drocket.png'
  const scene = 'http://localhost:8080/planet.jpg'
  const explosion = 'http://localhost:8080/explode-small.png'
  const engine = 'http://localhost:8080/engine.png'

  /* --uncomment for explosion sound effect
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false)
  const [play] = useSound('http://localhost:8080/explosion-sound.mp3', {
    volume: 0.5,
    }) 
  const audioOff = 'http://localhost:8080/audio-off.png'
  const audioOn = 'http://localhost:8080/audio-on.png'
  */

  const updatedResultsRef = useRef(false)

  useEffect(() => {
    const socket = initSocket()
    socket.emit('getConnectedClients')
    socket.on('connectedClients', (connectedClients: number) => {
      setPlayerCount(connectedClients)
    })

    socket.on('multiUpdate', (value: number) => {
      setMultiplier(value)
    })

    socket.on('crash', (value: number, hash: string) => {
      setCrashValue(value)
      if (!updatedResultsRef.current) {
        setLastResults((currentResults) => {
          return [...currentResults, { value, hash }].splice(-10)
        })
        //play() --uncomment for explosion sound effect
        updatedResultsRef.current = true
      }
      setMultiplier(value)
      setCrashed(true)
      setRunning(false)

      setBetPlaced(false)
    })
    socket.on('newGame', () => {
      setCrashed(false)
      setRunning(true)
      setCrashValue(Infinity)
      setRotation(1.5)
      setMultiplier(1)
      setXPosition(300)
      setYPosition(500)
      setThrusterLength(0.01)
      setRotationFinal(false)
      updatedResultsRef.current = false
    })
  }, [])

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

  function handleFormSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    if (betPlaced && !crashed) {
      setBet(0)
      setBetPlaced(false)
      takeProfit()
      return
    } else if (!running) {
      //placeBet()
      updateBalance(-bet)
      setBet(betAmount)
      setBetPlaced(true)
    }
  }
  function handleBetChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setBetAmount(parseInt(e.target.value))
  }
  function updateBalance(amount: number): void {
    setBalance((currentBalance) => currentBalance + amount)
  }
  function takeProfit(): void {
    const profit = parseInt((bet * multiplier).toFixed(2))
    updateBalance(profit)
  }

  const newGameStyle = new TextStyle({ fontSize: 40, fill: 'black' })
  const multiplierStyle = new TextStyle({ fontSize: 40, fill: 'white' })
  const playerCounterStyle = new TextStyle({ fontSize: 20, fill: 'white' })

  return (
    <>
      <Stage width={800} height={600} options={{ background: 0x1099bb }}>
        <Sprite image={scene} height={600} width={800} alpha={0.8} />
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
        <Sprite
          image={crashed ? explosion : rocket}
          x={xPosition}
          y={yPosition}
          scale={{ x: 0.5, y: 0.5 }}
          rotation={rotation}
          pivot={{ x: 179, y: 200 }}
        />
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
        <form onSubmit={handleFormSubmit}>
          <input
            type='number'
            className='text-black'
            onChange={handleBetChange}
          />
          <button type='submit' className='text-white'>
            {betPlaced ? 'Take Profit' : 'Place bet'}
          </button>
        </form>
        <p className='px-3'>{`balance: ${balance}`}</p>
      </div>
    </>
  )
}
