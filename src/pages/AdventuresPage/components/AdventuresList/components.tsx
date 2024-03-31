import { FC, useMemo } from 'react'

import classNames from 'classnames'
import { BanxAdventureSubscriptionState } from 'fbonds-core/lib/fbond-protocol/types'

import { Button } from '@banx/components/Buttons'
import Tooltip from '@banx/components/Tooltip'

import {
  AdventureStatus,
  BanxAdventureBN,
  BanxAdventureSubscriptionBN,
  BanxStakeBN,
  BanxStakingSettingsBN,
} from '@banx/api/staking'
import {
  BANX_TOKEN_DECIMALS,
  TOTAL_BANX_NFTS,
  TOTAL_BANX_NFTS_PARTNER_POINTS,
} from '@banx/constants'
import { useCountdown } from '@banx/hooks'
import { Alert, BanxToken, Clock, MoneyBill, SuccessIcon, Timer } from '@banx/icons'
import {
  banxTokenBNToFixed,
  calcPartnerPoints,
  calculateAdventureRewards,
  checkIsSubscribed,
  checkIsUserStaking,
  getAdventureEndTime,
  getAdventureStatus,
  isAdventureLive,
  isAdventureUpcomming,
} from '@banx/pages/AdventuresPage'
import { bnToHuman, formatCompact, formatNumbersWithCommas } from '@banx/utils'

import styles from './AdventuresList.module.less'

type NotParticipatedColumnProps = {
  banxAdventure: BanxAdventureBN
}
export const NotParticipatedColumn: FC<NotParticipatedColumnProps> = ({ banxAdventure }) => {
  const status = getAdventureStatus(banxAdventure)

  const TITLE_BY_STATUS: Record<AdventureStatus, string> = {
    [AdventureStatus.LIVE]: 'You are not subscribed',
    [AdventureStatus.ENDED]: "You didn't participate",
    [AdventureStatus.UPCOMING]: 'You are currently not subscribed',
  }

  return (
    <div className={styles.statsColWarn}>
      <Alert />
      <p>{TITLE_BY_STATUS[status]}</p>
    </div>
  )
}

type WalletParticipationColumnProps = {
  banxAdventure: BanxAdventureBN
  banxAdventureSubscription: BanxAdventureSubscriptionBN
}
export const WalletParticipationColumn: FC<WalletParticipationColumnProps> = ({
  banxAdventure,
  banxAdventureSubscription,
}) => {
  const { tokensPerPoints } = banxAdventure
  const {
    stakePartnerPointsAmount: stakedNftsPartnerPoints,
    stakeTokensAmount: userStakedTokensAmount,
    stakeNftAmount: userStakedNftsAmount,
  } = banxAdventureSubscription

  const userTokensPartnerPoints = calcPartnerPoints(userStakedTokensAmount, tokensPerPoints)

  const userPartnerPoints = userTokensPartnerPoints + stakedNftsPartnerPoints

  const TITLE_BY_STATUS: Record<AdventureStatus, string> = {
    [AdventureStatus.ENDED]: 'You participated with',
    [AdventureStatus.LIVE]: 'You are participating with',
    [AdventureStatus.UPCOMING]: 'You subscribed with',
  }

  const status = getAdventureStatus(banxAdventure)

  return (
    <div className={styles.statsCol}>
      <h5>{TITLE_BY_STATUS[status]}</h5>
      <p>{formatNumbersWithCommas(userStakedNftsAmount)} Banx NFTs</p>
      <p>{formatCompact(banxTokenBNToFixed(userStakedTokensAmount))} $BANX</p>
      <p>{formatNumbersWithCommas(userPartnerPoints.toFixed(2))} Partner pts</p>
    </div>
  )
}

type TotalParticipationColumnProps = {
  banxAdventure: BanxAdventureBN
  banxStakingSettings: BanxStakingSettingsBN
}
export const TotalParticipationColumn: FC<TotalParticipationColumnProps> = ({
  banxAdventure,
  banxStakingSettings,
}) => {
  const {
    totalTokensStaked: tokensSubscribed,
    totalBanxSubscribed: nftsSubscribed,
    tokensPerPoints,
    totalPartnerPoints: totalNftsPartnerPoints,
  } = banxAdventure
  const { maxTokenStakeAmount: maxTokensToSubscribe } = banxStakingSettings

  const maxTokensToSubscribeFloat = bnToHuman(maxTokensToSubscribe, BANX_TOKEN_DECIMALS)
  const tokensPerPointsFloat = bnToHuman(tokensPerPoints, BANX_TOKEN_DECIMALS)
  const totalTokensPartnerPoints = calcPartnerPoints(tokensSubscribed, tokensPerPoints)

  const partnerPointsSubscribed = totalTokensPartnerPoints + totalNftsPartnerPoints

  const maxPartnerPoints =
    maxTokensToSubscribeFloat / tokensPerPointsFloat + TOTAL_BANX_NFTS_PARTNER_POINTS

  const nftsSubscribedStr = `${formatNumbersWithCommas(nftsSubscribed)}/${formatNumbersWithCommas(
    TOTAL_BANX_NFTS,
  )}`

  const banxTokensSubscribedStr = `${formatCompact(
    banxTokenBNToFixed(tokensSubscribed, 0),
  )}/${formatCompact(banxTokenBNToFixed(maxTokensToSubscribe, 0))}`

  const partnerPointsStr = `${formatCompact(partnerPointsSubscribed.toFixed(0))}/${formatCompact(
    maxPartnerPoints.toFixed(0),
  )}`

  return (
    <div className={styles.statsCol}>
      <h5>Total participation</h5>
      <p>{nftsSubscribedStr} Banx NFTs</p>
      <p>{banxTokensSubscribedStr} $BANX</p>
      <p>{partnerPointsStr} Partner pts</p>
    </div>
  )
}

const TIMER_TEXT_BY_STATUS = {
  [AdventureStatus.LIVE]: 'Before rewards distribution',
  [AdventureStatus.UPCOMING]: 'Deadline to subscribe',
  DEFAULT: 'Before rewards distribution',
}

export const AdventuresTimer: FC<{
  banxAdventure: BanxAdventureBN
  banxAdventureSubscription?: BanxAdventureSubscriptionBN
}> = ({ banxAdventure, banxAdventureSubscription }) => {
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
      0,
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

type ParticipateButtonProps = {
  banxAdventure: BanxAdventureBN
  banxAdventureSubscription?: BanxAdventureSubscriptionBN
  banxTokenStake?: BanxStakeBN
  onClick: () => void
}
export const ParticipateButton: FC<ParticipateButtonProps> = ({
  banxAdventure,
  banxAdventureSubscription,
  banxTokenStake,
  onClick,
}) => {
  const isUserStaking = banxTokenStake ? checkIsUserStaking(banxTokenStake) : false

  const isSubscribed = banxAdventureSubscription
    ? checkIsSubscribed(banxAdventureSubscription)
    : false

  const isUpcomming = isAdventureUpcomming(banxAdventure)
  const isLive = isAdventureLive(banxAdventure)

  const showSubscribeBtn = isUpcomming && !isSubscribed
  const showParticipating = isLive && isSubscribed
  const showSubscribed = isUpcomming && isSubscribed

  if (showSubscribeBtn) {
    return (
      <Button
        disabled={isSubscribed || !isUserStaking}
        onClick={onClick}
        className={styles.subscribeBtn}
      >
        Subscribe to participate
      </Button>
    )
  }

  if (showParticipating) {
    return (
      <Button
        disabled
        className={classNames(styles.subscribeBtn, styles.subscribeBtnParticipating)}
      >
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
