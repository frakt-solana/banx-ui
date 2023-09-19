import { FC } from 'react'

import { useCountdown } from '@banx/hooks'

import styles from './Timer.module.less'

interface TimerProps {
  expiredAt: number //? unix timestamp
}

const Timer: FC<TimerProps> = ({ expiredAt }) => {
  const { timeLeft } = useCountdown(expiredAt)

  const { days, hours, minutes, seconds } = timeLeft

  const formatTimeUnit = (value: string, unit: string) => (
    <>
      {value}
      {unit} :
    </>
  )

  if (!parseFloat(days) && !parseFloat(hours)) {
    return (
      <span className={styles.timer}>
        {formatTimeUnit(minutes, 'm')} {seconds}s
      </span>
    )
  }

  if (!parseFloat(days)) {
    return (
      <span className={styles.timer}>
        {formatTimeUnit(hours, 'h')} {formatTimeUnit(minutes, 'm')} {seconds}s
      </span>
    )
  }

  return (
    <span className={styles.timer}>
      {formatTimeUnit(days, 'd')} {formatTimeUnit(hours, 'h')} {minutes}m
    </span>
  )
}

export default Timer
