import React, { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { BANX_ADVENTURE_GAP } from 'fbonds-core/lib/fbond-protocol/constants'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { BanxAdventureSubscriptionState } from 'fbonds-core/lib/fbond-protocol/types'
import { capitalize } from 'lodash'
import moment from 'moment'
import { TxnExecutor } from 'solana-transactions-executor'

import { AdventureStatus } from '@banx/api/adventures'
import {
  BanxAdventure,
  BanxStake,
  BanxStakeSettings,
  BanxSubscription,
} from '@banx/api/banxTokenStake'
import { BANX_TOKEN_STAKE_DECIMAL, TOTAL_BANX_NFTS, TOTAL_BANX_PTS } from '@banx/constants/banxNfts'
import { calcPartnerPoints } from '@banx/pages/AdventuresPage/helpers'
import { useBanxStakeState } from '@banx/pages/AdventuresPage/state'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { subscribeBanxAdventureAction } from '@banx/transactions/banxStaking'
import {
  enqueueSnackbar,
  formatNumbersWithCommas as format,
  formatCompact,
  fromDecimals,
  toDecimals,
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
  maxTokenStakeAmount: string
}

const AdventuresCard: FC<AdventuresCardProps> = ({
  banxAdventure,
  walletConnected,
  maxTokenStakeAmount,
  banxSubscription,
}) => {
  const { connection } = useConnection()
  const isEnded = parseFloat(banxAdventure.periodEndingAt) < moment().unix()
  const isStarted = parseFloat(banxAdventure.periodStartedAt) + BANX_ADVENTURE_GAP < moment().unix()
  const { banxStake, banxTokenSettings } = useBanxStakeState()
  const priorityFees = usePriorityFees()

  const wallet = useWallet()

  const calcMaxPts = (): string => {
    if (!banxTokenSettings) {
      return '0'
    }

    const maxTokenStakeAmount = toDecimals(
      banxTokenSettings.maxTokenStakeAmount,
      BANX_TOKEN_STAKE_DECIMAL,
    )

    return (
      parseFloat(maxTokenStakeAmount) / parseFloat(banxAdventure.tokensPerPoints) +
      TOTAL_BANX_PTS
    ).toString()
  }

  const tokenPts = calcPartnerPoints(banxAdventure.totalTokensStaked, banxAdventure.tokensPerPoints)
  const totalAdventurePts = (
    parseFloat(fromDecimals(tokenPts, BANX_TOKEN_STAKE_DECIMAL)) +
    parseFloat(banxAdventure.totalPartnerPoints)
  ).toFixed(2)

  const isParticipating =
    !!banxStake?.banxTokenStake?.tokensStaked || !!banxStake?.banxTokenStake?.banxNftsStakedQuantity

  const isSubscribed =
    banxSubscription?.adventureSubscriptionState === BanxAdventureSubscriptionState.Active

  const totalBanxSubscribed = `${format(banxAdventure.totalBanxSubscribed)}/${format(
    TOTAL_BANX_NFTS,
  )}`
  const totalBanxTokensSubscribed = `${formatCompact(
    fromDecimals(banxAdventure.totalTokensStaked, BANX_TOKEN_STAKE_DECIMAL),
  )}/${formatCompact(maxTokenStakeAmount)}`

  const totalPartnerPoints = `${formatCompact(totalAdventurePts)}/${formatCompact(calcMaxPts())}`

  const status = useMemo(() => {
    if (isEnded) {
      return AdventureStatus.ENDED
    }

    if (parseFloat(banxAdventure.periodStartedAt) + BANX_ADVENTURE_GAP > moment().unix()) {
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
      weeks: [parseFloat(banxAdventure.week)],
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
  const walletTokenPts = calcPartnerPoints(
    banxSubscription?.stakeTokensAmount || '0',
    banxAdventure.tokensPerPoints.toString(),
  )

  const totalWalletPts =
    parseFloat(fromDecimals(walletTokenPts, BANX_TOKEN_STAKE_DECIMAL)) +
    parseFloat(banxSubscription?.stakePartnerPointsAmount || '0')

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
          isSubscribed={isSubscribed}
          status={status}
          endsAt={
            isStarted
              ? parseFloat(banxAdventure.periodEndingAt)
              : parseFloat(banxAdventure.periodStartedAt) + BANX_ADVENTURE_GAP
          }
        />

        <div className={styles.stats}>
          <TotalParticipationColumn
            totalBanxTokensSubscribed={totalBanxTokensSubscribed}
            totalBanxSubscribed={totalBanxSubscribed}
            totalPartnerPoints={totalPartnerPoints}
          />

          {wallet.connected && isSubscribed && (
            <WalletParticipationColumn
              status={banxSubscription?.adventureSubscriptionState}
              banxTokenAmount={formatCompact(
                fromDecimals(banxSubscription.stakeTokensAmount, BANX_TOKEN_STAKE_DECIMAL),
              )}
              banxAmount={format(banxSubscription.stakeNftAmount)}
              partnerPts={format(totalWalletPts)}
            />
          )}

          {!!walletConnected && !isSubscribed && (
            <NotParticipatedColumn status={AdventureStatus.LIVE} />
          )}
        </div>
      </div>

      {wallet.connected && (
        <Participate
          isParticipating={isParticipating}
          isNone={banxAdventure.adventureState === 'none'}
          isStarted={isStarted}
          isSubscribed={isSubscribed}
          isDisabled={!wallet.publicKey?.toBase58()}
          onSubmit={onSubscribe}
        />
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
      {banxStake.banxAdventures
        // TODO until 38 will not finished
        .filter(({ adventure }) => adventure.week !== '38')
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
