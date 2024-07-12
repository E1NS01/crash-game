import { Toaster } from '@/components/ui/toaster'
import dynamic from 'next/dynamic'

const Game = dynamic(() => import('../components/Game'), { ssr: false })

export default function Home() {
  return (
    <>
      <Game />
      <Toaster />
    </>
  )
}
