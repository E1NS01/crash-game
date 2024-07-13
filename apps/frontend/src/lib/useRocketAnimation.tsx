import {
  animationSpeed,
  movementSpeed,
  rotationSpeed
} from '@/constants/animationConstants'
import { useEffect } from 'react'

/**
 * useRocketAnimation
 *
 * @description Custom hook for animating the rocket sprite.
 
 * The rocket sprite is moved by changing the x and y position of the sprite, and rotatd by changing the sprites' rotation.
 * The background is moved by changing the backgroundX and backgroundY position.
 * 
 *
 * @param running
 * @param backgroundX
 * @param setXPosition
 * @param setYPosition
 * @param setBackgroundX
 * @param setBackgroundY
 * @param rotationFinal
 * @param setRotation
 * @param setRotationFinal
 */
function useRocketAnimation(
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
          (currentXPosition) => currentXPosition + movementSpeed * 0.6
        )
        setBackgroundX(
          (currentBackgroundX) => currentBackgroundX - movementSpeed * 2
        )
        setYPosition(
          (currentYPosition) => currentYPosition - movementSpeed * 0.43
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
    backgroundX
  ])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    function animate(): void {
      setRotation((currentRotation) => {
        if (currentRotation <= 0.55) {
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

export default useRocketAnimation
