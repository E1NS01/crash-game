import dynamic from 'next/dynamic'

const Pixi = dynamic(() => import('./pixi'), { ssr: false })

export default function Home() {
  return (
    <>
      <Pixi />
    </>
  )
}
