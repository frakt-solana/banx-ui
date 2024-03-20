import React, { FC, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { BanxAdventureSubscriptionState } from 'fbonds-core/lib/fbond-protocol/types'
import { capitalize } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'

import { AdventureStatus } from '@banx/api/adventures'
import {
  BanxAdventure,
  BanxStake,
  BanxStakeSettings,
  BanxSubscription,
} from '@banx/api/banxTokenStake'
import { BANX_TOKEN_STAKE_DECIMAL, TOTAL_BANX_NFTS, TOTAL_BANX_PTS } from '@banx/constants/banxNfts'
import { Clock, SuccessIcon } from '@banx/icons'
import { useBanxStakeState } from '@banx/pages/AdventuresPage/state'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { subscribeBanxAdventureAction } from '@banx/transactions/banxStaking'
import {
  enqueueSnackbar,
  formatNumbersWithCommas as format,
  formatCompact,
  fromDecimals,
  usePriorityFees,
} from '@banx/utils'

import {
  AdventuresTimer,
  NotParticipatedColumn,
  TotalParticipationColumn,
  WalletParticipationColumn,
} from './components'

import styles from './AdventuresList.module.less'

interface AdventuresCardProps {
  banxSubscription?: BanxSubscription
  banxAdventure: BanxAdventure
  walletConnected?: boolean
  maxTokenStakeAmount: number
}

const AdventuresCard: FC<AdventuresCardProps> = ({
  banxAdventure,
  walletConnected,
  maxTokenStakeAmount,
  banxSubscription,
}) => {
  const [isLoading, setLoading] = useState(false)
  const { connection } = useConnection()
  const isEnded = banxAdventure.periodEndingAt * 1000 < Date.now()
  const { banxStake, banxTokenSettings, updateStake } = useBanxStakeState()
  const priorityFees = usePriorityFees()

  const wallet = useWallet()

  const isParticipating =
    !!banxSubscription?.stakeTokensAmount || !!banxSubscription?.stakeNftAmount

  const totalBanxSubscribed = `${format(
    fromDecimals(banxAdventure.totalBanxSubscribed, BANX_TOKEN_STAKE_DECIMAL),
  )}/${format(TOTAL_BANX_NFTS)}`
  const totalBanxTokensSubscribed = `${formatCompact(
    banxAdventure.totalTokensStaked,
  )}/${formatCompact(maxTokenStakeAmount)}`
  const totalPartnerPoints = `${banxAdventure.totalPartnerPoints}/${format(TOTAL_BANX_PTS)}`

  const status = useMemo(() => {
    if (isEnded) {
      return AdventureStatus.ENDED
    }

    return AdventureStatus.LIVE
  }, [isEnded])

  const onSubscribe = () => {
    if (!wallet.publicKey?.toBase58() || !banxTokenSettings || !banxStake?.banxTokenStake) {
      return
    }
    setLoading(true)
    const banxSubscribeAdventureOptimistic: BanxSubscribeAdventureOptimistic = {
      banxStakingSettings: banxTokenSettings,
      banxAdventures: banxStake.banxAdventures,
      banxTokenStake: banxStake.banxTokenStake,
    }

    const params = {
      weeks: [banxAdventure.week],
      userPubkey: wallet.publicKey,
      optimistic: {
        banxSubscribeAdventureOptimistic,
      },
      priorityFees,
    }

    new TxnExecutor(subscribeBanxAdventureAction, { wallet, connection })
      .addTxnParam(params)
      .on('pfSuccessEach', (results) => {
        setLoading(false)
        const { txnHash } = results[0]
        enqueueSnackbar({
          message: 'Subscribed successfully',
          type: 'success',
          solanaExplorerPath: `tx/${txnHash}`,
        })
        results.forEach(({ result }) => {
          const { banxStakingSettings, banxAdventures, banxTokenStake } = result || {}

          if (!banxStakingSettings || !banxAdventures || !banxTokenStake) {
            return
          }

          updateStake({
            banxTokenSettings: result?.banxStakingSettings,
            banxStake: {
              ...banxStake,
              banxAdventures: banxAdventures,
              banxTokenStake: banxTokenStake,
            },
          })
        })
      })
      .on('pfSuccessAll', () => {
        close()
        setLoading(false)
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: params,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Subscribe',
        })
        setLoading(false)
      })
      .execute()
  }

  const isSubscribed =
    banxSubscription?.adventureSubscriptionState === BanxAdventureSubscriptionState.Active

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
        <AdventuresTimer status={status} endsAt={banxAdventure.periodEndingAt} />

        <div className={styles.stats}>
          <TotalParticipationColumn
            totalBanxSubscribed={totalBanxSubscribed}
            totalBanxTokensSubscribed={totalBanxTokensSubscribed}
            totalPartnerPoints={totalPartnerPoints}
          />

          {isParticipating && (
            <WalletParticipationColumn
              status={status}
              banxTokenAmount={formatCompact(banxSubscription.stakeTokensAmount)}
              banxAmount={format(banxSubscription.stakeNftAmount)}
              partnerPts={format(banxSubscription.stakePartnerPointsAmount)}
            />
          )}

          {!!walletConnected && <NotParticipatedColumn status={AdventureStatus.LIVE} />}
        </div>
      </div>

      {isSubscribed && (
        <Button disabled className={styles.subscribeBtn}>
          <div>
            <SuccessIcon />
            <span>Subscribed</span>
          </div>
        </Button>
      )}

      {!isSubscribed && !!wallet.publicKey?.toBase58() && (
        <Button disabled={isLoading} onClick={onSubscribe} className={styles.subscribeBtn}>
          {isLoading ? (
            <div>
              <Clock />
              <span>Participating</span>
            </div>
          ) : (
            'Subscribe to participate'
          )}
        </Button>
      )}
    </li>
  )
}

interface AdventuresListProps {
  banxTokenSettings: BanxStakeSettings
  banxStake: BanxStake
  className?: string
}

export const AdventuresList: FC<AdventuresListProps> = ({
  banxTokenSettings,
  banxStake,
  className,
}) => {
  const { connected } = useWallet()

  return (
    <ul className={classNames(styles.list, className)}>
      {banxStake.banxAdventures.map(({ adventure, adventureSubscription }) => (
        <AdventuresCard
          banxSubscription={adventureSubscription}
          banxAdventure={adventure}
          key={adventure?.publicKey}
          walletConnected={connected}
          maxTokenStakeAmount={banxTokenSettings.maxTokenStakeAmount}
        />
      ))}
    </ul>
  )
}
