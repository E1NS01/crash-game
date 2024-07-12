'use client'
import { LastResultsData } from '@/interfaces/lastResultsData'

export default function LastResults({
  results,
}: {
  results: LastResultsData[]
}) {
  return (
    <div className='flex mt-3'>
      <p className='font-bold text-xl'>Last Results:</p>
      {results.map((result: LastResultsData, index: number) => (
        <p
          key={index}
          className={
            result.value > 2
              ? 'text-green-500 px-2 text-lg'
              : 'text-red-500 px-2 text-lg'
          }
        >
          {result.value.toFixed(2)}
        </p>
      ))}
    </div>
  )
}
