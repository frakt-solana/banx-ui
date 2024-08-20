import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

// import Tooltip from '@banx/components/Tooltip'
import { staking } from '@banx/api/common'
import {
  BANX_TOKEN_DECIMALS,
  TOTAL_BANX_NFTS,
  TOTAL_BANX_NFTS_PARTNER_POINTS,
} from '@banx/constants'
import { useCountdown } from '@banx/hooks'
import {
  Alert,
  BanxLogo,
  /*BanxToken,*/
  Clock,
  MoneyBill,
  SuccessIcon,
  Timer,
} from '@banx/icons'
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
  useBanxTokenCirculatingAmount,
} from '@banx/pages/common/AdventuresPage'
import { bnToHuman, formatCompact, formatNumbersWithCommas } from '@banx/utils'

import styles from './AdventuresList.module.less'

type NotParticipatedColumnProps = {
  banxAdventure: staking.BanxAdventure
}
export const NotParticipatedColumn: FC<NotParticipatedColumnProps> = ({ banxAdventure }) => {
  const status = getAdventureStatus(banxAdventure)

  const TITLE_BY_STATUS: Record<staking.AdventureStatus, string> = {
    [staking.AdventureStatus.LIVE]: 'You are not subscribed',
    [staking.AdventureStatus.ENDED]: "You didn't participate",
    [staking.AdventureStatus.UPCOMING]: 'You are currently not subscribed',
  }

  return (
    <div className={styles.statsColWarn}>
      <Alert />
      <p>{TITLE_BY_STATUS[status]}</p>
    </div>
  )
}

type WalletParticipationColumnProps = {
  banxAdventure: staking.BanxAdventure
  banxAdventureSubscription: staking.BanxAdventureSubscription
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

  const userPartnerPoints = userTokensPartnerPoints + stakedNftsPartnerPoints.toNumber()

  const TITLE_BY_STATUS: Record<staking.AdventureStatus, string> = {
    [staking.AdventureStatus.ENDED]: 'You participated with',
    [staking.AdventureStatus.LIVE]: 'You are participating with',
    [staking.AdventureStatus.UPCOMING]: 'You subscribed with',
  }

  const status = getAdventureStatus(banxAdventure)

  return (
    <div className={styles.statsCol}>
      <h5>{TITLE_BY_STATUS[status]}</h5>
      <p>{formatNumbersWithCommas(userStakedNftsAmount.toNumber())} Banx NFTs</p>
      <p>{formatCompact(banxTokenBNToFixed(userStakedTokensAmount))} $BANX</p>
      <p>{formatNumbersWithCommas(userPartnerPoints.toFixed(2))} Partner pts</p>
    </div>
  )
}

type TotalParticipationColumnProps = {
  banxAdventure: staking.BanxAdventure
}
export const TotalParticipationColumn: FC<TotalParticipationColumnProps> = ({ banxAdventure }) => {
  const { amount: maxTokensToSubscribe } = useBanxTokenCirculatingAmount()

  const {
    totalTokensStaked: tokensSubscribed,
    totalBanxSubscribed: nftsSubscribed,
    tokensPerPoints,
    totalPartnerPoints: totalNftsPartnerPoints,
  } = banxAdventure

  const maxTokensToSubscribeFloat = bnToHuman(maxTokensToSubscribe, BANX_TOKEN_DECIMALS)
  const tokensPerPointsFloat = bnToHuman(tokensPerPoints, BANX_TOKEN_DECIMALS)
  const totalTokensPartnerPoints = calcPartnerPoints(tokensSubscribed, tokensPerPoints)

  const partnerPointsSubscribed = totalTokensPartnerPoints + totalNftsPartnerPoints.toNumber()

  const maxPartnerPoints =
    maxTokensToSubscribeFloat / tokensPerPointsFloat + TOTAL_BANX_NFTS_PARTNER_POINTS

  const nftsSubscribedStr = `${formatNumbersWithCommas(
    nftsSubscribed.toNumber(),
  )}/${formatNumbersWithCommas(TOTAL_BANX_NFTS)}`

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

type AdventuresTimerProps = {
  banxAdventure: staking.BanxAdventure
  banxAdventureSubscription?: staking.BanxAdventureSubscription
}
export const AdventuresTimer: FC<AdventuresTimerProps> = ({
  banxAdventure,
  // banxAdventureSubscription,
}) => {
  const TIMER_TITLE_BY_STATUS: Record<staking.AdventureStatus, string> = {
    [staking.AdventureStatus.LIVE]: 'Before rewards distribution',
    [staking.AdventureStatus.UPCOMING]: 'Deadline to subscribe',
    [staking.AdventureStatus.ENDED]: '',
  }
  const status = getAdventureStatus(banxAdventure)
  const title = TIMER_TITLE_BY_STATUS[status]

  const endsAt = getAdventureEndTime(banxAdventure)

  const isLive = isAdventureLive(banxAdventure)

  const timeLeft = useCountdown(endsAt)

  // const isSubscribed = !!banxAdventureSubscription && checkIsSubscribed(banxAdventureSubscription)
  // const rewards: string = useMemo(() => {
  //   if (!isSubscribed) return '0'

  //   return banxTokenBNToFixed(
  //     calculateAdventureRewards([
  //       { adventure: banxAdventure, subscription: banxAdventureSubscription },
  //     ]),
  //     0,
  //   )
  // }, [banxAdventure, banxAdventureSubscription, isSubscribed])

  return (
    <div className={styles.timerWrapper}>
      <div className={styles.timerIcon}>
        {isLive ? <MoneyBill /> : <Timer className={styles.timerSvg} />}
      </div>
      <div>
        <span className={styles.timer}>
          {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m
        </span>
        <p className={styles.timerText}>{title}</p>
        {/* {isSubscribed && isLive && (
          <div className={styles.distributed}>
            <span>you will receive</span>
            <span className={styles.value}>{formatNumbersWithCommas(rewards)}</span>
            <BanxToken className={styles.banxIcon} />
            <Tooltip
              className={styles.tooltip}
              title="Every week Banx purchases $BANX from the market using 100% of its revenue and then distribute these tokens to stakers, proportionally to their partner points"
            />
          </div>
        )} */}
      </div>
    </div>
  )
}

type AdventureEndedRewardsResultProps = {
  banxAdventure: staking.BanxAdventure
  banxAdventureSubscription?: staking.BanxAdventureSubscription
}
export const AdventureEndedRewardsResult: FC<AdventureEndedRewardsResultProps> = ({
  banxAdventure,
  banxAdventureSubscription,
}) => {
  const { connected } = useWallet()
  const isSubscribed = !!banxAdventureSubscription && checkIsSubscribed(banxAdventureSubscription)

  const rewards: string = useMemo(() => {
    if (!connected) {
      return banxTokenBNToFixed(banxAdventure.amountOfTokensHarvested, 0)
    }

    if (!banxAdventureSubscription || !isSubscribed) {
      return '0'
    }

    return banxTokenBNToFixed(
      calculateAdventureRewards([
        { adventure: banxAdventure, subscription: banxAdventureSubscription },
      ]),
      0,
    )
  }, [banxAdventure, banxAdventureSubscription, isSubscribed, connected])

  const title = connected ? 'You received' : 'Total distributed'

  return (
    <div className={styles.endedRewards}>
      <div className={styles.endedRewardsValue}>
        <p>{formatNumbersWithCommas(rewards)}</p>
        <BanxLogo className={styles.endedRewardsBanxLogo} />
      </div>
      <p className={styles.endedRewardsText}>{title}</p>
    </div>
  )
}

type ParticipateButtonProps = {
  banxAdventure: staking.BanxAdventure
  banxAdventureSubscription?: staking.BanxAdventureSubscription
  banxTokenStake?: staking.BanxTokenStake
  onClick: () => void
}
export const ParticipateButton: FC<ParticipateButtonProps> = ({
  banxAdventure,
  banxAdventureSubscription,
  banxTokenStake,
  onClick,
}) => {
  const isUserStaking = !!banxTokenStake && checkIsUserStaking(banxTokenStake)

  const isSubscribed = !!banxAdventureSubscription && checkIsSubscribed(banxAdventureSubscription)

  const isUpcomming = isAdventureUpcomming(banxAdventure)
  const isLive = isAdventureLive(banxAdventure)

  const showSubscribeBtn = isUpcomming && !isSubscribed
  const showParticipating = isLive && isSubscribed
  const showSubscribed = isUpcomming && isSubscribed

  if (showSubscribeBtn) {
    return (
      <Button
        disabled={!isUserStaking || isSubscribed}
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
