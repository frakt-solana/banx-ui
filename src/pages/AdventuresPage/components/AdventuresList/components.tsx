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

interface AdventuresComponentsProps {}

export const AdventureSubscribeButton: FC<AdventuresComponentsProps> = () => {
  const { connection } = useConnection()
  const wallet = useWallet()

  //   new TxnExecutor(
  //     makeSubscribeNftsAction,
  //     {wallet, connection},
  //     {signAllChunks: isLedger ? 5 : 20},
  //   )
  //     .addTxnParams(params)
  //     .on('pfSuccessEach', (results) => {
  //       const {txnHash} = results[0]
  //       enqueueSnackbar({
  //         message: 'Subscribed successfully',
  //         type: 'success',
  //         solanaExplorerPath: `tx/${txnHash}`,
  //       })
  //     })
  //     .on('pfSuccessAll', () => {
  //       refetch()
  //     })
  //     .on('pfError', (error) => {
  //       defaultTxnErrorHandler(error, {
  //         additionalData: params,
  //         walletPubkey: wallet?.publicKey?.toBase58(),
  //         transactionName: 'SubscribeBanx',
  //       })
  //     })
  //     .execute()
  // }, [refetch, connection, wallet, adventure, stakedNfts, subscribedNfts, isLedger])

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
