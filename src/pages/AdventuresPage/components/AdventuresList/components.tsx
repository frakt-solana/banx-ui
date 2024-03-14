import { FC, useCallback, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Adventure, BanxUser } from 'fbonds-core/lib/fbond-protocol/types'
import { chunk, find } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'

import { AdventureNft, AdventureStatus } from '@banx/api/adventures'
import { useCountdown } from '@banx/hooks'
import { Alert, CircleCheck, MoneyBill, Timer } from '@banx/icons'
import { useIsLedger } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import {
  NFTS_TO_SUBSCRIBE_PER_TXN,
  getAdventureStatus,
  isNftParticipating,
  makeSubscribeNftsAction,
} from '@banx/transactions/adventures'
import { START_PERIOD_TIME_ADJUST } from '@banx/transactions/adventures/constants'
import { enqueueSnackbar, formatNumbersWithCommas } from '@banx/utils'

import { calcNftsPartnerPoints, isNftStaked } from '../../helpers'
import { useAdventuresInfo, useBanxStats } from '../../hooks'

import styles from './AdventuresList.module.less'

interface AdventuresComponentsProps {
  adventure: Adventure
  banxUser?: BanxUser
  nfts?: AdventureNft[]
  walletConnected?: boolean
  setNftsModalOpen: (nextValue: boolean) => void
}

export const AdventureSubscribeButton: FC<AdventuresComponentsProps> = ({
  adventure,
  walletConnected,
  nfts = [],
  setNftsModalOpen,
}) => {
  const adventureStatus = getAdventureStatus(adventure)
  const isUpcoming = adventureStatus === AdventureStatus.UPCOMING

  const { connection } = useConnection()
  const wallet = useWallet()
  const { isLedger } = useIsLedger()

  const { refetch } = useAdventuresInfo()

  const stakedNfts = useMemo(() => {
    return nfts.filter(isNftStaked)
  }, [nfts])

  const subscribedNfts = useMemo(() => {
    return nfts.filter((nft) => isNftParticipating(nft, adventure.publicKey))
  }, [nfts, adventure])

  const subscribe = useCallback(() => {
    if (!stakedNfts) return

    const subscribedNftsMints = subscribedNfts.map(({ mint }) => mint)
    const nftsToSubscribe = stakedNfts.filter(({ mint }) => !subscribedNftsMints.includes(mint))
    const nftsChunks = chunk(nftsToSubscribe, NFTS_TO_SUBSCRIBE_PER_TXN)

    const params = nftsChunks.map((nftChunk) => ({
      nfts: nftChunk,
      adventureToSubscribe: adventure,
    }))

    new TxnExecutor(
      makeSubscribeNftsAction,
      { wallet, connection },
      { signAllChunks: isLedger ? 5 : 20, maxRetries: 10 },
    )
      .addTxnParams(params)
      .on('pfSuccessEach', (results) => {
        const { txnHash } = results[0]
        enqueueSnackbar({
          message: 'Subscribed successfully',
          type: 'success',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfSuccessAll', () => {
        refetch()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: params,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'SubscribeBanx',
        })
      })
      .execute()
  }, [refetch, connection, wallet, adventure, stakedNfts, subscribedNfts, isLedger])

  const isParticipating = !!subscribedNfts.length

  const subscribeUpdateAvailable = useMemo(() => {
    return stakedNfts.length !== subscribedNfts.length && stakedNfts.length && subscribedNfts.length
  }, [stakedNfts, subscribedNfts])

  if (subscribeUpdateAvailable && isParticipating && isUpcoming)
    return (
      <Button variant="secondary" className={styles.subscribeBtn} onClick={subscribe}>
        Update subscription with new Banx
      </Button>
    )

  if (isUpcoming && walletConnected && !isParticipating)
    return (
      <Button
        variant="primary"
        className={styles.subscribeBtn}
        onClick={stakedNfts.length ? subscribe : () => setNftsModalOpen(true)}
      >
        Subscribe to participate
      </Button>
    )

  return <></>
}

export const AdventureStatusLine: FC<AdventuresComponentsProps> = ({ adventure, nfts = [] }) => {
  enum Status {
    PARTICIPATING = 'Participating',
    SUBSCRIBED = 'Subscribed',
    REWARDED = 'Rewared',
    NOT_REWARDED = 'Not rewarded',
    DEFAULT = '',
  }

  const isRewarded = useMemo(() => {
    if (nfts.length) {
      const subscribedNfts = nfts.filter((nft) => isNftParticipating(nft, adventure.publicKey))

      return !!find(subscribedNfts, (nft) => nft?.banxStake?.farmedAmount !== 0)
    }

    return false
  }, [adventure, nfts])

  const status = useMemo(() => {
    const adventureStatus = getAdventureStatus(adventure)

    const isParticipating = (() => {
      if (nfts?.length) {
        return !!nfts.find((nft) => isNftParticipating(nft, adventure.publicKey))
      }
      return false
    })()

    const isLive = adventureStatus === AdventureStatus.LIVE
    const isUpcoming = adventureStatus === AdventureStatus.UPCOMING
    const isEnded = adventureStatus === AdventureStatus.ENDED

    if (isParticipating && isLive) return Status.PARTICIPATING
    if (isParticipating && isUpcoming) return Status.SUBSCRIBED
    if (isEnded && isRewarded) return Status.REWARDED
    if (isEnded && !isRewarded) return Status.NOT_REWARDED
    return Status.DEFAULT
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nfts])

  const TEXT_BY_STATUS = {
    [Status.PARTICIPATING]: 'Participating',
    [Status.SUBSCRIBED]: 'Subscribed',
    [Status.REWARDED]: 'Rewarded',
    [Status.NOT_REWARDED]:
      'Not rewarded... Next time, make sure you have Banx and they are not listed',
    [Status.DEFAULT]: '',
  }

  const ICON_BY_STATUS = {
    [Status.PARTICIPATING]: <Timer className={styles.statusLineIconTimer} />,
    [Status.SUBSCRIBED]: <CircleCheck />,
    [Status.REWARDED]: <MoneyBill />,
    [Status.NOT_REWARDED]: null,
    [Status.DEFAULT]: null,
  }

  return TEXT_BY_STATUS[status] ? (
    <div className={styles.statusLine}>
      {ICON_BY_STATUS[status] && (
        <div className={styles.statusLineIcon}>{ICON_BY_STATUS[status]}</div>
      )}
      <p>{TEXT_BY_STATUS[status]}</p>
    </div>
  ) : (
    <></>
  )
}

export const NotParticipatedColumn: FC<AdventuresComponentsProps> = ({ adventure }) => {
  const TEXT_BY_STATUS = {
    [AdventureStatus.ENDED]: "You didn't participate",
    [AdventureStatus.LIVE]: 'You are not subscribed',
    DEFAULT: 'You are currently not subscribed',
  }

  const adventureStatus = getAdventureStatus(adventure)

  return (
    <div className={styles.statsColWarn}>
      <Alert />
      <p>
        {TEXT_BY_STATUS[adventureStatus as keyof typeof TEXT_BY_STATUS] || TEXT_BY_STATUS.DEFAULT}
      </p>
    </div>
  )
}

export const WalletParticipationColumn: FC<AdventuresComponentsProps> = ({
  adventure,
  nfts = [],
}) => {
  const TITLE_BY_STATUS = {
    [AdventureStatus.ENDED]: 'You participated with',
    [AdventureStatus.LIVE]: 'You are participating with',
    DEFAULT: 'You subscribed with',
  }

  const adventureStatus = getAdventureStatus(adventure)

  const { nftsAmount, points } = useMemo(() => {
    if (nfts.length) {
      const subscribedNfts = nfts.filter((nft) => isNftParticipating(nft, adventure.publicKey))

      const nftsAmount = subscribedNfts.length
      const points = calcNftsPartnerPoints(subscribedNfts)

      return { nftsAmount, points }
    }

    return { nftsAmount: 0, points: 0 }
  }, [nfts, adventure])

  return (
    <div className={styles.statsCol}>
      <h5>
        {TITLE_BY_STATUS[adventureStatus as keyof typeof TITLE_BY_STATUS] ||
          TITLE_BY_STATUS.DEFAULT}
      </h5>
      <p>{nftsAmount} Banx</p>
      <p>{points} Partner pts</p>
    </div>
  )
}

export const TotalParticipationColumn: FC<AdventuresComponentsProps> = ({ adventure }) => {
  const { data: banxStats } = useBanxStats()

  const TITLE_BY_STATUS = {
    [AdventureStatus.ENDED]: 'Total participation',
    DEFAULT: 'Total participating',
  }

  const adventureStatus = getAdventureStatus(adventure)

  const format = formatNumbersWithCommas

  const totalBanxSubscribed = `${format(adventure.totalBanxSubscribed)}${
    banxStats ? `/${format(banxStats.totalRevealed)}` : ''
  }`

  const totalPartnerPoints = `${format(adventure.totalPartnerPoints)}${
    banxStats ? `/${format(banxStats.totalPartnerPoints)}` : ''
  }`

  return (
    <div className={styles.statsCol}>
      <h5>
        {TITLE_BY_STATUS[adventureStatus as keyof typeof TITLE_BY_STATUS] ||
          TITLE_BY_STATUS.DEFAULT}
      </h5>
      <p>{totalBanxSubscribed} Banx</p>
      <p>{totalPartnerPoints} Partner pts</p>
    </div>
  )
}

export const AdventuresTimer: FC<AdventuresComponentsProps> = ({ adventure }) => {
  const TIMER_TEXT_BY_STATUS = {
    [AdventureStatus.LIVE]: 'Before rewards distribution',
    [AdventureStatus.UPCOMING]: 'Deadline to subscribe',
    DEFAULT: '',
  }

  const adventureStatus = getAdventureStatus(adventure)

  const isLive = adventureStatus === AdventureStatus.LIVE

  const { timeLeft } = useCountdown(
    isLive ? adventure.periodEndingAt : adventure.periodStartedAt + START_PERIOD_TIME_ADJUST,
  )

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
          {TIMER_TEXT_BY_STATUS[adventureStatus as keyof typeof TIMER_TEXT_BY_STATUS] ||
            TIMER_TEXT_BY_STATUS.DEFAULT}
        </p>
      </div>
    </div>
  )
}
