import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { capitalize, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { staking } from '@banx/api/common'
import {
  checkIsSubscribed,
  getAdventureStatus,
  isAdventureEnded,
  useBanxStakeInfo,
  useBanxStakeSettings,
} from '@banx/pages/common/AdventuresPage'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  createSubscribeTxnData,
  parseAnyStakingSimulatedAccounts,
} from '@banx/transactions/staking'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmationSingle,
} from '@banx/utils'

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
  banxStakeInfo: staking.BanxStakingInfo
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
      {adventuresAndSubscriptions?.map(({ adventure, adventureSubscription }) => (
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
  banxAdventure: staking.BanxAdventure
  banxAdventureSubscription?: staking.BanxAdventureSubscription
  banxTokenStake?: staking.BanxTokenStake
}

const AdventuresCard: FC<AdventuresCardProps> = ({
  banxAdventure,
  banxAdventureSubscription,
  banxTokenStake,
}) => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { setOptimistic: setBanxStakeSettingsOptimistic } = useBanxStakeSettings()
  const { setOptimistic: setBanxStakeInfoOptimistic } = useBanxStakeInfo()

  const isEnded = isAdventureEnded(banxAdventure)

  const isSubscribed = !!banxAdventureSubscription && checkIsSubscribed(banxAdventureSubscription)

  const status = getAdventureStatus(banxAdventure)

  const onSubscribe = async () => {
    if (!wallet.publicKey?.toBase58() || !banxTokenStake) {
      return
    }

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createSubscribeTxnData(
        { weeks: [banxAdventure.week] },
        walletAndConnection,
      )

      await new TxnExecutor(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
        debug: { preventSending: true },
      })
        .addTxnData(txnData)
        .on('sentAll', (results) => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmationSingle(loadingSnackbarId, results[0].signature)
        })
        .on('confirmedAll', (results) => {
          destroySnackbar(loadingSnackbarId)

          const { confirmed, failed } = results

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Subscribed successfully', type: 'success' })

            confirmed.forEach((result) => {
              if (result.accountInfoByPubkey) {
                const { banxStakingSettings, banxTokenStake, banxAdventuresWithSubscription } =
                  parseAnyStakingSimulatedAccounts(result.accountInfoByPubkey)

                setBanxStakeSettingsOptimistic(banxStakingSettings)
                setBanxStakeInfoOptimistic(wallet.publicKey!.toBase58(), {
                  banxAdventuresWithSubscription,
                  banxTokenStake,
                })
              }
            })
          }

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: banxAdventure.week,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'Subscribe',
      })
    }
  }

  return (
    <li className={styles.card}>
      <div className={styles.header}>
        <h3 className={classNames(styles.title, { [styles.titleEnded]: isEnded })}>
          Week {banxAdventure.week.toNumber()}
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
        {isEnded && (
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
