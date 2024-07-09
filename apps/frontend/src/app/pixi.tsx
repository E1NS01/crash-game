'use client'
import { useEffect, useState } from 'react'
import { Sprite, Stage, Text } from '@pixi/react'
import { getHash, getMultiplier } from '@/helper/calculations'
import { TextStyle } from '@pixi/text'
import { Texture } from '@pixi/core'
import useSound from 'use-sound'

export default function Pixi() {
  const [rotation, setRotation] = useState<number>(1.5)
  const [rotationFinal, setRotationFinal] = useState<boolean>(false)
  const [multiplier, setMultiplier] = useState<number>(1)
  const [xPosition, setXPosition] = useState<number>(300)
  const [yPosition, setYPosition] = useState<number>(500)
  const [lastResults, setLastResults] = useState<number[]>([])
  const [crashValue, setCrashValue] = useState<number>(
    getMultiplier(getHash()).multiplier
  )
  const [lastHash, setLastHash] = useState<string>('')
  const [currentHash, setCurrentHash] = useState<string>('')
  const [running, setRunning] = useState<boolean>(true)
  const [crashed, setCrashed] = useState<boolean>(false)
  const [countdown, setCountdown] = useState<number>(5)

  const rocket = 'http://localhost:8080/3drocket.png'
  const scene = 'http://localhost:8080/planet.jpg'
  const explosion = 'http://localhost:8080/explode-small.png'
  const [play] = useSound('http://localhost:8080/explosion-sound.mp3', {
    volume: 0.5,
  })

  useEffect(() => {
    const gameData = getMultiplier(getHash())
    setCrashValue(gameData.multiplier)
    setCurrentHash(gameData.hash)
  }, [])

  useEffect(() => {
    if (crashed) {
      setLastResults((currentResults) => {
        return [...currentResults, crashValue].slice(-10)
      })
      const intervalId = setInterval(() => {
        setCountdown((currentCountdown) => {
          if (currentCountdown === 0) {
            setCountdown(5)
            setRotation(1.5)
            setMultiplier(1)
            setXPosition(300)
            setYPosition(500)
            setCrashed(false)
            setRunning(true)
            setRotationFinal(false)
            setLastHash(currentHash)
            const data = getMultiplier(getHash())
            setCurrentHash(data.hash)
            setCrashValue(data.multiplier)
            return 5
          }
          return currentCountdown - 1
        })
      }, 1000)
      return () => clearInterval(intervalId)
    }
  }, [crashed, currentHash, lastHash, crashValue])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (running) {
        setMultiplier((currentMultiplier) => {
          const newMultiplier = currentMultiplier * 1.003
          if (newMultiplier >= crashValue) {
            //play() // Uncomment this line to play the explosion sound on crash
            setCrashed(true)
            setRunning(false)
            return crashValue
          }
          return newMultiplier
        })
        rotateSprite()
      }
    }, 15)

    function rotateSprite() {
      if (!rotationFinal) {
        setXPosition((currentXPosition) => currentXPosition + 0.75)
        setYPosition((currentYPosition) => currentYPosition - 0.75)
      }
    }
    return () => clearTimeout(timeoutId)
  }, [crashValue, running, multiplier, rotationFinal, play])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const animate = () => {
      setRotation((currentRotation) => {
        if (currentRotation <= 0.1) {
          setRotationFinal(true)
          return currentRotation
        }
        return currentRotation - 0.003
      })
      timeoutId = setTimeout(animate, 17) //
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
            className={result > 2 ? 'px-2 text-green-500' : 'px-2 text-red-500'}
          >
            {result.toFixed(2) + ' '}
          </p>
        ))}
      </div>
    </>
  )
}
