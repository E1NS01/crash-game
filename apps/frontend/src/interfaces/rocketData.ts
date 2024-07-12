export interface RocketData {
  backgroundX: number
  crashed: boolean
  running: boolean
  xPosition: number
  yPosition: number
  setXPosition: React.Dispatch<React.SetStateAction<number>>
  setYPosition: React.Dispatch<React.SetStateAction<number>>
  rotation: number
  rotationFinal: boolean
  setRotationFinal: React.Dispatch<React.SetStateAction<boolean>>
  setRotation: React.Dispatch<React.SetStateAction<number>>
  setBackgroundX: React.Dispatch<React.SetStateAction<number>>
  setBackgroundY: React.Dispatch<React.SetStateAction<number>>
}
