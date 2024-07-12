'use client'
import { GameData } from '@/interfaces/gameData'
import { Text } from '@pixi/react'
import { TextStyle } from '@pixi/text'

export default function GameInfo({
  gameId,
  betId,
  multiplier,
  playerCount,
}: GameData) {
  const multiplierStyle = new TextStyle({ fontSize: 40, fill: 'white' })
  const playerCounterStyle = new TextStyle({ fontSize: 20, fill: 'white' })
  const gameDataStyle = new TextStyle({ fontSize: 10, fill: 'white' })
  return (
    <>
      <Text text={`gameID: ${gameId}`} x={0} y={0} style={gameDataStyle} />
      <Text text={`betID: ${betId}`} x={80} y={0} style={gameDataStyle} />
      <Text text='Multiplier:' x={80} y={110} style={multiplierStyle} />
      <Text
        text={`${multiplier.toFixed(2)}x`}
        x={80}
        y={150}
        style={multiplierStyle}
      />
      <Text
        text={`Current Players: ${playerCount}`}
        y={570}
        x={610}
        style={playerCounterStyle}
      />
    </>
  )
}
