import { FC } from 'react'

import { useCountdown } from '@banx/hooks'

import styles from './Timer.module.less'

interface TimerProps {
  expiredAt: number //? unix timestamp
  detailedTimeFormat?: boolean
}

const Timer: FC<TimerProps> = ({ expiredAt, detailedTimeFormat = false }) => {
  const { timeLeft } = useCountdown(expiredAt)

  const { days, hours, minutes, seconds } = timeLeft

  const formatTime = (time: string, unit: string) => (
    <>
      {time}
      {unit} <span>:</span>
    </>
  )

  return detailedTimeFormat ? (
    <span className={styles.timer}>
      {formatTime(hours, 'h')} {formatTime(minutes, 'm')} {seconds}s
    </span>
  ) : (
    <span className={styles.timer}>
      {formatTime(days, 'd')} {formatTime(hours, 'h')} {minutes}m
    </span>
  )
}

export default Timer
