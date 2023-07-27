import { useEffect, useRef, useState } from 'react'

import { padStart } from 'lodash'
import moment, { Duration, Moment } from 'moment'

export interface CountdownTime {
  days: string
  hours: string
  minutes: string
  seconds: string
}

type UseCountdown = (endTimeUnix: number) => {
  timeLeft: CountdownTime
}

export const useCountdown: UseCountdown = (endTimeUnix: number) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [currentTimeUnix, setCurrentTimeUnix] = useState<number | null>(null)
  const [timePassedInSeconds, setTimePassedInSeconds] = useState<number>(0)

  const calculateTimeDifference = (endTimeMoment: Moment, currentTime: Moment): Duration => {
    return moment.duration(endTimeMoment.diff(currentTime))
  }

  const updateTimeDifference = () => {
    const endTimeMoment = moment.unix(endTimeUnix)
    const currentTime = moment.unix(currentTimeUnix! + timePassedInSeconds)
    return calculateTimeDifference(endTimeMoment, currentTime)
  }

  useEffect(() => {
    setCurrentTimeUnix(moment().unix())

    intervalRef.current = setInterval(() => {
      setTimePassedInSeconds((prevTimePassed) => prevTimePassed + 1)
    }, 1000)

    return () => clearInterval(intervalRef.current!)
  }, [])

  useEffect(() => {
    const timeDifference = updateTimeDifference()

    if (timeDifference.asSeconds() < 0) {
      clearInterval(intervalRef.current!)
    }
  }, [currentTimeUnix, timePassedInSeconds, endTimeUnix])

  const timeDifference = updateTimeDifference()
  const isExpired = timeDifference.asSeconds() < 0

  const formatWithLeadingZero = (value: number): string => {
    return isExpired ? '00' : padStart(value.toString(), 2, '0')
  }

  const days = formatWithLeadingZero(timeDifference.days())
  const hours = formatWithLeadingZero(timeDifference.hours())
  const minutes = formatWithLeadingZero(timeDifference.minutes())
  const seconds = formatWithLeadingZero(timeDifference.seconds())

  return {
    timeLeft: { days, hours, minutes, seconds },
  }
}
