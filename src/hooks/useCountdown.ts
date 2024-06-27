import { useEffect, useRef, useState } from 'react'

import { Duration } from 'moment'

import { CountdownUnits, getTimeDifference, splitTimeDifferenceToUnits } from '@banx/utils'

export const useCountdown = (endTimeUnix: number): CountdownUnits => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [timeDifference, setTimeDifference] = useState<Duration>(getTimeDifference(endTimeUnix))

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeDifference(getTimeDifference(endTimeUnix))
    }, 1000)

    return () => clearInterval(intervalRef.current!)
  }, [endTimeUnix])

  return splitTimeDifferenceToUnits(timeDifference)
}
