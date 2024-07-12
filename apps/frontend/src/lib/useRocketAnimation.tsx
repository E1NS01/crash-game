import {
  animationSpeed,
  movementSpeed,
  rotationSpeed,
} from '@/app/constants/animationConstants'
import { set } from 'lodash'
import { useEffect } from 'react'

/**
 * useRocketAnimation
 *
 * @description Custom hook for animating the rocket sprite
 *
 * @param running
 * @param setXPosition
 * @param setYPosition
 * @param setBackgroundX
 * @param setBackgroundY
 * @param rotationFinal
 * @param setRotation
 * @param setRotationFinal
 * @param initialMovementSpeedX
 * @param initialMovementSpeedY
 */
function useAnimation(
  running: boolean,
  backgroundX: number,
  setXPosition: React.Dispatch<React.SetStateAction<number>>,
  setYPosition: React.Dispatch<React.SetStateAction<number>>,
  setBackgroundX: React.Dispatch<React.SetStateAction<number>>,
  setBackgroundY: React.Dispatch<React.SetStateAction<number>>,
  rotationFinal: boolean,
  setRotation: React.Dispatch<React.SetStateAction<number>>,
  setRotationFinal: React.Dispatch<React.SetStateAction<boolean>>
) {
  useEffect(() => {
    let animationFrameId: number

    const rotateSprite = () => {
      if (Math.abs(backgroundX) < 1600) {
        setXPosition(
          (currentXPosition) => currentXPosition + movementSpeed * 0.7
        )
        setBackgroundX(
          (currentBackgroundX) => currentBackgroundX - movementSpeed * 2
        )
        setYPosition(
          (currentYPosition) => currentYPosition - movementSpeed * 0.5
        )
        setBackgroundY(
          (currentBackgroundY) => currentBackgroundY + movementSpeed * 3
        )
        animationFrameId = requestAnimationFrame(rotateSprite)
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
  }, [
    running,
    rotationFinal,
    setXPosition,
    setYPosition,
    setBackgroundX,
    setBackgroundY,
    backgroundX,
  ])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    function animate(): void {
      setRotation((currentRotation) => {
        if (currentRotation <= 0.48) {
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
  }, [running, setRotation, setRotationFinal])
}

export default useAnimation
