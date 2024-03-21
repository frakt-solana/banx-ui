import React, { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { BANX_ADVENTURE_GAP } from 'fbonds-core/lib/fbond-protocol/constants'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { BanxAdventureSubscriptionState } from 'fbonds-core/lib/fbond-protocol/types'
import { capitalize } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { AdventureStatus } from '@banx/api/adventures'
import {
  BanxAdventure,
  BanxStake,
  BanxStakeSettings,
  BanxSubscription,
} from '@banx/api/banxTokenStake'
import { BANX_TOKEN_STAKE_DECIMAL, TOTAL_BANX_NFTS, TOTAL_BANX_PTS } from '@banx/constants/banxNfts'
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
  Participate,
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
  const { connection } = useConnection()
  const isEnded = banxAdventure.periodEndingAt * 1000 < Date.now()
  const isStarted = banxAdventure.periodStartedAt * 1000 + BANX_ADVENTURE_GAP * 1000 > Date.now()
  const { banxStake, banxTokenSettings, updateStake } = useBanxStakeState()
  const priorityFees = usePriorityFees()

  const wallet = useWallet()

  const isParticipating =
    !!banxSubscription?.stakeTokensAmount || !!banxSubscription?.stakeNftAmount

  const totalBanxSubscribed = `${format(banxAdventure.totalBanxSubscribed)}/${format(
    TOTAL_BANX_NFTS,
  )}`
  const totalBanxTokensSubscribed = `${formatCompact(
    fromDecimals(banxAdventure.totalTokensStaked, BANX_TOKEN_STAKE_DECIMAL),
  )}/${formatCompact(fromDecimals(maxTokenStakeAmount))}`
  const totalPartnerPoints = `${banxAdventure.totalPartnerPoints}/${format(TOTAL_BANX_PTS)}`

  const status = useMemo(() => {
    if (isEnded) {
      return AdventureStatus.ENDED
    }
    if (banxAdventure.periodStartedAt * 1000 + BANX_ADVENTURE_GAP > Date.now()) {
      return AdventureStatus.UPCOMING
    }

    return AdventureStatus.LIVE
  }, [isEnded, banxAdventure.periodStartedAt])

  const onSubscribe = () => {
    if (!wallet.publicKey?.toBase58() || !banxTokenSettings || !banxStake?.banxTokenStake) {
      return
    }
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
        <AdventuresTimer
          adventureWithSubscription={{
            adventure: banxAdventure,
            adventureSubscription: banxSubscription,
          }}
          status={status}
          endsAt={
            isStarted
              ? banxAdventure.periodStartedAt + BANX_ADVENTURE_GAP
              : banxAdventure.periodEndingAt
          }
        />

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

          {!!walletConnected && !isParticipating && (
            <NotParticipatedColumn status={AdventureStatus.LIVE} />
          )}
        </div>
      </div>

      <Participate
        isStarted={isStarted}
        isSubscribed={isSubscribed}
        isDisabled={!wallet.publicKey?.toBase58()}
        onSubmit={onSubscribe}
      />
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
      {banxStake.banxAdventures
        .sort((a, b) => (a.adventure.week > b.adventure.week ? 1 : -1))
        .map(({ adventure, adventureSubscription }) => (
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
