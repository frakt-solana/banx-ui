import React, { FC, useMemo } from 'react'

import { BanxAdventureSubscriptionState } from 'fbonds-core/lib/fbond-protocol/types'

import { Button } from '@banx/components/Buttons'
import Tooltip from '@banx/components/Tooltip'

import { AdventureStatus, BanxAdventureBN, BanxAdventureSubscriptionBN } from '@banx/api/staking'
import { useCountdown } from '@banx/hooks'
import { Alert, BanxToken, Clock, MoneyBill, SuccessIcon, Timer } from '@banx/icons'
import {
  banxTokenBNToFixed,
  calculateAdventureRewards,
  getAdventureEndTime,
  getAdventureStatus,
} from '@banx/pages/AdventuresPage/helpers'
import { formatNumbersWithCommas } from '@banx/utils'

import styles from './AdventuresList.module.less'

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
  status: BanxAdventureSubscriptionState
}> = (props) => {
  const TITLE_BY_STATUS = {
    [BanxAdventureSubscriptionState.Active]: 'You subscribed with',
    [BanxAdventureSubscriptionState.None]: 'You are participating with',
    DEFAULT: 'You subscribed with',
  }

  const { status, partnerPts, banxAmount, banxTokenAmount } = props

  return (
    <div className={styles.statsCol}>
      <h5>{TITLE_BY_STATUS[status as keyof typeof TITLE_BY_STATUS] || TITLE_BY_STATUS.DEFAULT}</h5>
      <p>{banxAmount} Banx NFTs</p>
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
      <p>{totalBanxSubscribed} Banx NFTs</p>
      <p>{totalBanxTokensSubscribed} $BANX</p>
      <p>{totalPartnerPoints} Partner pts</p>
    </div>
  )
}

export const AdventuresTimer: FC<{
  banxAdventure: BanxAdventureBN
  banxAdventureSubscription?: BanxAdventureSubscriptionBN
}> = ({ banxAdventure, banxAdventureSubscription }) => {
  const TIMER_TEXT_BY_STATUS = {
    [AdventureStatus.LIVE]: 'Before rewards distribution',
    [AdventureStatus.UPCOMING]: 'Deadline to subscribe',
    DEFAULT: 'Before rewards distribution',
  }

  const isSubscribed =
    banxAdventureSubscription?.adventureSubscriptionState === BanxAdventureSubscriptionState.Active

  const status = getAdventureStatus(banxAdventure)

  const endsAt = getAdventureEndTime(banxAdventure)

  const isLive = status === AdventureStatus.LIVE
  const { timeLeft } = useCountdown(endsAt)

  const rewards: string = useMemo(() => {
    if (!banxAdventureSubscription || !isSubscribed) return '0'

    return banxTokenBNToFixed(
      calculateAdventureRewards([
        { adventure: banxAdventure, subscription: banxAdventureSubscription },
      ]),
      2,
    )
  }, [banxAdventure, banxAdventureSubscription, isSubscribed])

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
        {isSubscribed && status === AdventureStatus.LIVE && (
          <div className={styles.distributed}>
            <span>you will receive</span>
            <span className={styles.value}>{formatNumbersWithCommas(rewards)}</span>
            <BanxToken className={styles.banxIcon} />
            <Tooltip
              className={styles.tooltip}
              title="Every week Banx purchases $BANX from the market using 100% of its revenue and then distribute these tokens to stakers, proportionally to their partner points"
            />
          </div>
        )}
      </div>
    </div>
  )
}

interface ParticipateProps {
  isStarted: boolean
  isSubscribed: boolean
  isDisabled: boolean
  isParticipating: boolean
  isNone: boolean
  onSubmit: () => void
}

export const Participate: FC<ParticipateProps> = ({
  isStarted,
  isSubscribed,
  isDisabled,
  isNone,
  isParticipating,
  onSubmit,
}) => {
  const showParticipating = isStarted && isSubscribed
  const showSubscribeBtn = (!isStarted && !isSubscribed) || (isNone && !isStarted)
  const showSubscribed = !isStarted && isSubscribed

  if (showSubscribeBtn) {
    return (
      <Button
        disabled={isDisabled || !isParticipating}
        onClick={onSubmit}
        className={styles.subscribeBtn}
      >
        Subscribe to participate
      </Button>
    )
  }

  if (showParticipating) {
    return (
      <Button disabled className={styles.subscribeBtn}>
        <div>
          <Clock />
          <span>Participating</span>
        </div>
      </Button>
    )
  }

  if (showSubscribed) {
    return (
      <Button disabled className={styles.subscribeBtn}>
        <div>
          <SuccessIcon />
          <span>Subscribed</span>
        </div>
      </Button>
    )
  }

  return null
}
