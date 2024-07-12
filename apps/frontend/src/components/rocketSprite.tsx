'use client'
import { RocketData } from '@/interfaces/rocketData'
import { Sprite } from '@pixi/react'

export default function RocketSprite({
  crashed,
  xPosition,
  yPosition,
  rotation,
  rotationFinal,
  thrusterLength,
}: RocketData) {
  const rocket = process.env.NEXT_PUBLIC_URL + '/3drocket.png'
  const explosion = process.env.NEXT_PUBLIC_URL + '/explode-small.png'
  const engine = process.env.NEXT_PUBLIC_URL + '/engine.png'
  return (
    <>
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
    </>
  )
}
