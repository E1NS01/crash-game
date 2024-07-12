'use client'
import { RocketData } from '@/interfaces/rocketData'
import useAnimation from '@/lib/useRocketAnimation'
import { Sprite } from '@pixi/react'

export default function RocketSprite({
  backgroundX,
  crashed,
  running,
  xPosition,
  yPosition,
  setXPosition,
  setYPosition,
  rotation,
  rotationFinal,
  setRotationFinal,
  setRotation,
  setBackgroundX,
  setBackgroundY,
}: RocketData) {
  const rocket = process.env.NEXT_PUBLIC_URL + '/3drocket.png'
  const explosion = process.env.NEXT_PUBLIC_URL + '/explode-small.png'

  useAnimation(
    running,
    backgroundX,
    setXPosition,
    setYPosition,
    setBackgroundX,
    setBackgroundY,
    rotationFinal,
    setRotation,
    setRotationFinal
  )

  return (
    <>
      <Sprite
        image={crashed ? explosion : rocket}
        x={xPosition}
        y={yPosition}
        scale={{ x: 0.5, y: 0.5 }}
        rotation={rotation}
        pivot={{ x: 179, y: 200 }}
      />
    </>
  )
}
