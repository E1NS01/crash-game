import dynamic from 'next/dynamic'

const Game = dynamic(() => import('./Game'), { ssr: false })

export default function Home() {
  return (
    <>
      <Game />
    </>
  )
}
