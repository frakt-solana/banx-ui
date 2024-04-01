import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { capitalize } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import {
  BanxAdventureBN,
  BanxAdventureSubscriptionBN,
  BanxInfoBN,
  BanxStakeBN,
} from '@banx/api/staking'
import { checkIsSubscribed, getAdventureStatus, isAdventureEnded } from '@banx/pages/AdventuresPage'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { subscribeBanxAdventureAction } from '@banx/transactions/staking'
import { enqueueSnackbar, usePriorityFees } from '@banx/utils'

import {
  AdventureEndedRewardsResult,
  AdventuresTimer,
  NotParticipatedColumn,
  ParticipateButton,
  TotalParticipationColumn,
  WalletParticipationColumn,
} from './components'
import { useAdventuresAndSubscriptions } from './hooks'

import styles from './AdventuresList.module.less'

interface AdventuresListProps {
  banxStakeInfo: BanxInfoBN
  historyMode: boolean
  className?: string
}

export const AdventuresList: FC<AdventuresListProps> = ({
  banxStakeInfo,
  historyMode,
  className,
}) => {
  const adventuresAndSubscriptions = useAdventuresAndSubscriptions(banxStakeInfo, historyMode)

  return (
    <ul className={classNames(styles.list, className)}>
      {adventuresAndSubscriptions.map(({ adventure, adventureSubscription }) => (
        <AdventuresCard
          key={adventure?.publicKey}
          banxAdventureSubscription={adventureSubscription ?? undefined}
          banxAdventure={adventure}
          banxTokenStake={banxStakeInfo.banxTokenStake ?? undefined}
        />
      ))}
    </ul>
  )
}

interface AdventuresCardProps {
  banxAdventure: BanxAdventureBN
  banxAdventureSubscription?: BanxAdventureSubscriptionBN
  banxTokenStake?: BanxStakeBN
}

const AdventuresCard: FC<AdventuresCardProps> = ({
  banxAdventure,
  banxAdventureSubscription,
  banxTokenStake,
}) => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const priorityFees = usePriorityFees()

  const isEnded = isAdventureEnded(banxAdventure)

  const isSubscribed = !!banxAdventureSubscription && checkIsSubscribed(banxAdventureSubscription)

  const status = getAdventureStatus(banxAdventure)

  const onSubscribe = () => {
    if (!wallet.publicKey?.toBase58() || !banxTokenStake) {
      return
    }

    const params = {
      weeks: [banxAdventure.week],
      userPubkey: wallet.publicKey,
      priorityFees,
    }

    new TxnExecutor(subscribeBanxAdventureAction, { wallet, connection })
      .addTxnParam(params)
      .on('pfSuccessEach', (results) => {
        const { txnHash } = results[0]
        enqueueSnackbar({
          message: 'Transaction sent',
          type: 'info',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfSuccessAll', () => {
        close()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: params,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Subscribe',
        })
      })
      .execute()
  }

  return (
    <li className={styles.card}>
      <div className={styles.header}>
        <h3 className={classNames(styles.title, { [styles.titleEnded]: isEnded })}>
          Week {banxAdventure.week}
        </h3>
        <p className={classNames(styles.status, styles[`status__${status}`])}>
          {capitalize(status)}
        </p>
      </div>
      <div className={styles.info}>
        {!isEnded && (
          <AdventuresTimer
            banxAdventureSubscription={banxAdventureSubscription}
            banxAdventure={banxAdventure}
          />
        )}
        {isEnded && wallet.connected && (
          <AdventureEndedRewardsResult
            banxAdventureSubscription={banxAdventureSubscription}
            banxAdventure={banxAdventure}
          />
        )}
        <div className={styles.stats}>
          <TotalParticipationColumn banxAdventure={banxAdventure} />

          {wallet.connected && isSubscribed && !!banxAdventureSubscription && (
            <WalletParticipationColumn
              banxAdventure={banxAdventure}
              banxAdventureSubscription={banxAdventureSubscription}
            />
          )}

          {!!wallet.connected && !isSubscribed && (
            <NotParticipatedColumn banxAdventure={banxAdventure} />
          )}
        </div>
      </div>

      {wallet.connected && (
        <ParticipateButton
          banxAdventure={banxAdventure}
          banxAdventureSubscription={banxAdventureSubscription}
          banxTokenStake={banxTokenStake}
          onClick={onSubscribe}
        />
      )}
    </li>
  )
}
