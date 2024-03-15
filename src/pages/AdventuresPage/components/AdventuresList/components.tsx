import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import { AdventureStatus } from '@banx/api/adventures'
import { useCountdown } from '@banx/hooks'
import { Alert, MoneyBill, Timer } from '@banx/icons'

import styles from './AdventuresList.module.less'

interface AdventuresComponentsProps {}

export const AdventureSubscribeButton: FC<AdventuresComponentsProps> = () => {
  return (
    <Button variant="primary" className={styles.subscribeBtn}>
      Subscribe to participate
    </Button>
  )
}

export const NotParticipatedColumn: FC<{ status: AdventureStatus }> = ({ status }) => {
  const TEXT_BY_STATUS = {
    [AdventureStatus.ENDED]: "You didn't participate",
    [AdventureStatus.LIVE]: 'You are not subscribed',
    DEFAULT: 'You are currently not subscribed',
  }

  return (
    <div className={styles.statsColWarn}>
      <Alert />
      <p>{TEXT_BY_STATUS[status as keyof typeof TEXT_BY_STATUS] || TEXT_BY_STATUS.DEFAULT}</p>
    </div>
  )
}

export const WalletParticipationColumn: FC<{
  banxTokenAmount: string
  banxAmount: string
  partnerPts: string | number
  status: AdventureStatus
}> = (props) => {
  const TITLE_BY_STATUS = {
    [AdventureStatus.ENDED]: 'You participated with',
    [AdventureStatus.LIVE]: 'You are participating with',
    DEFAULT: 'You subscribed with',
  }

  const { status, partnerPts, banxAmount, banxTokenAmount } = props

  return (
    <div className={styles.statsCol}>
      <h5>{TITLE_BY_STATUS[status as keyof typeof TITLE_BY_STATUS] || TITLE_BY_STATUS.DEFAULT}</h5>
      <p>{banxAmount} Banx</p>
      <p>{banxTokenAmount} $BANX</p>
      <p>{partnerPts} Partner pts</p>
    </div>
  )
}

export const TotalParticipationColumn: FC<{
  totalBanxSubscribed: string
  totalBanxTokensSubscribed: string
  totalPartnerPoints: string
}> = ({ totalBanxSubscribed, totalPartnerPoints, totalBanxTokensSubscribed }) => {
  return (
    <div className={styles.statsCol}>
      <h5>Total participation</h5>
      <p>{totalBanxSubscribed} Banx</p>
      <p>{totalBanxTokensSubscribed} $BANX</p>
      <p>{totalPartnerPoints} Partner pts</p>
    </div>
  )
}

export const AdventuresTimer: FC<{ status: AdventureStatus; endsAt: number }> = ({
  status,
  endsAt,
}) => {
  const TIMER_TEXT_BY_STATUS = {
    [AdventureStatus.LIVE]: 'Before rewards distribution',
    [AdventureStatus.UPCOMING]: 'Deadline to subscribe',
    DEFAULT: '',
  }

  const isLive = status === AdventureStatus.LIVE

  const { timeLeft } = useCountdown(endsAt)

  return (
    <div className={styles.timerWrapper}>
      <div className={styles.timerIcon}>
        {isLive ? <MoneyBill /> : <Timer className={styles.timerSvg} />}
      </div>
      <div>
        <span className={styles.timer}>
          {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m
        </span>
        <p className={styles.timerText}>
          {TIMER_TEXT_BY_STATUS[status as keyof typeof TIMER_TEXT_BY_STATUS] ||
            TIMER_TEXT_BY_STATUS.DEFAULT}
        </p>
      </div>
    </div>
  )
}
