'use cliet'
import { Texture } from '@pixi/core'
import { Sprite, Text } from '@pixi/react'
import { TextStyle } from '@pixi/text'

export default function CrashOverlay() {
  const newGameStyle = new TextStyle({ fontSize: 40, fill: 'black' })
  return (
    <>
      <Sprite
        texture={Texture.WHITE}
        x={0}
        y={0}
        width={800}
        height={600}
        alpha={0.3}
      />
      <Text
        text={`Waiting for next round...`}
        x={180}
        y={200}
        style={newGameStyle}
      />
      <Text text={`Place your bets!`} x={230} y={275} style={newGameStyle} />
    </>
  )
}
