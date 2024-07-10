'use client'
import { useEffect, useRef, useState } from 'react'
import { Sprite, Stage, Text } from '@pixi/react'
import { TextStyle } from '@pixi/text'
import { Texture } from '@pixi/core'
import { initSocket } from '@/helper/socketio'

//import useSound from 'use-sound' -- uncomment for explosion sound effect

export default function Pixi() {
  const [rotation, setRotation] = useState<number>(1.5)
  const [rotationFinal, setRotationFinal] = useState<boolean>(false)
  const [multiplier, setMultiplier] = useState<number>(1)
  const [xPosition, setXPosition] = useState<number>(300)
  const [yPosition, setYPosition] = useState<number>(500)
  const [lastResults, setLastResults] = useState<any[]>([])
  const [playerCount, setPlayerCount] = useState<number>(0)
  const [crashValue, setCrashValue] = useState<number>(Infinity)
  const [lastHash, setLastHash] = useState<string>('')
  const [currentHash, setCurrentHash] = useState<string>('')
  const [running, setRunning] = useState<boolean>(false)
  const [crashed, setCrashed] = useState<boolean>(true)
  const [countdown, setCountdown] = useState<number>(5)

  const rocket = 'http://localhost:8080/3drocket.png'
  const scene = 'http://localhost:8080/planet.jpg'
  const explosion = 'http://localhost:8080/explode-small.png'

  //uncomment for explosion sound effect
  /* 
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false)
  const [play] = useSound('http://localhost:8080/explosion-sound.mp3', {
    volume: 0.5,
  }) 
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
        updatedResultsRef.current = true
      }
      setMultiplier(value)
      setCrashed(true)
      setRunning(false)
    })
    socket.on('newGame', () => {
      setCrashed(false)
      setRunning(true)
      setCrashValue(Infinity)
      setRotation(1.5)
      setMultiplier(1)
      setXPosition(300)
      setYPosition(500)
      setRotationFinal(false)
      updatedResultsRef.current = false
    })
    return () => {
      socket.close()
    }
  }, [])

  useEffect(() => {
    if (running) {
      rotateSprite()
    }
    multiplier
    function rotateSprite() {
      if (!rotationFinal) {
        setXPosition((currentXPosition) => currentXPosition + 0.75)
        setYPosition((currentYPosition) => currentYPosition - 0.75)
      }
    }
  }, [multiplier, running, rotationFinal])

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
        <Sprite
          image={crashed ? explosion : rocket}
          width={400}
          height={400}
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
            <Text text={`${countdown}`} x={360} y={350} style={newGameStyle} />
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
    </>
  )
}
