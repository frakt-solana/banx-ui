import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { BanxAdventureSubscriptionState } from 'fbonds-core/lib/fbond-protocol/types'
import { capitalize } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import {
  AdventureStatus,
  BanxAdventureBN,
  BanxAdventureSubscriptionBN,
  BanxInfoBN,
  BanxStakeBN,
  BanxStakingSettingsBN,
} from '@banx/api/staking'
import { TOTAL_BANX_NFTS, TOTAL_BANX_PTS } from '@banx/constants'
import {
  banxTokenBNToFixed,
  calcPartnerPoints,
  checkIsParticipatingInAdventure,
  getAdventureStatus,
  isAdventureEnded,
  isAdventureStarted,
} from '@banx/pages/AdventuresPage'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { subscribeBanxAdventureAction } from '@banx/transactions/staking'
import {
  ZERO_BN,
  enqueueSnackbar,
  formatCompact,
  formatNumbersWithCommas,
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

interface AdventuresListProps {
  banxStakingSettings: BanxStakingSettingsBN
  banxStakeInfo: BanxInfoBN
  className?: string
}

export const AdventuresList: FC<AdventuresListProps> = ({
  banxStakingSettings,
  banxStakeInfo,
  className,
}) => {
  return (
    <ul className={classNames(styles.list, className)}>
      {[...banxStakeInfo.banxAdventures]
        .sort(
          ({ adventure: adventureA }, { adventure: adventureB }) =>
            adventureA.week - adventureB.week,
        )
        .map(({ adventure, adventureSubscription }) => (
          <AdventuresCard
            key={adventure?.publicKey}
            banxAdventureSubscription={adventureSubscription ?? undefined}
            banxAdventure={adventure}
            banxStakingSettings={banxStakingSettings}
            banxTokenStake={banxStakeInfo.banxTokenStake ?? undefined}
          />
        ))}
    </ul>
  )
}

interface AdventuresCardProps {
  banxAdventure: BanxAdventureBN
  banxStakingSettings: BanxStakingSettingsBN
  banxAdventureSubscription?: BanxAdventureSubscriptionBN
  banxTokenStake?: BanxStakeBN
}

const AdventuresCard: FC<AdventuresCardProps> = ({
  banxAdventure,
  banxStakingSettings,
  banxAdventureSubscription,
  banxTokenStake,
}) => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const priorityFees = usePriorityFees()

  const { maxTokenStakeAmount } = banxStakingSettings
  const maxTokenStakeAmountStr = banxTokenBNToFixed(maxTokenStakeAmount)

  const { tokensPerPoints } = banxAdventure
  const tokensPerPointsStr = banxTokenBNToFixed(tokensPerPoints)

  const isEnded = isAdventureEnded(banxAdventure)
  const isStarted = isAdventureStarted(banxAdventure)

  //TODO Refactor
  const calcMaxPts = (): string => {
    return (
      parseFloat(maxTokenStakeAmountStr) / parseFloat(tokensPerPointsStr) +
      TOTAL_BANX_PTS
    ).toString()
  }

  const tokenPts = calcPartnerPoints(banxAdventure.totalTokensStaked, banxAdventure.tokensPerPoints)
  const totalAdventurePts = (tokenPts + banxAdventure.totalPartnerPoints).toFixed(2)

  const isParticipating = checkIsParticipatingInAdventure(banxTokenStake)

  const isSubscribed =
    banxAdventureSubscription?.adventureSubscriptionState === BanxAdventureSubscriptionState.Active

  const totalBanxSubscribed = `${formatNumbersWithCommas(
    banxAdventure.totalBanxSubscribed,
  )}/${formatNumbersWithCommas(TOTAL_BANX_NFTS)}`

  const totalBanxTokensSubscribed = `${formatCompact(
    banxTokenBNToFixed(banxAdventure.totalTokensStaked),
  )}/${formatCompact(maxTokenStakeAmountStr)}`

  const totalPartnerPoints = `${formatCompact(totalAdventurePts)}/${formatCompact(calcMaxPts())}`

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

  const walletTokenPts = calcPartnerPoints(
    banxAdventureSubscription?.stakeTokensAmount ?? ZERO_BN,
    banxAdventure.tokensPerPoints,
  )

  const totalWalletPts = walletTokenPts + (banxAdventureSubscription?.stakePartnerPointsAmount ?? 0)

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
          banxAdventureSubscription={banxAdventureSubscription}
          banxAdventure={banxAdventure}
        />

        <div className={styles.stats}>
          <TotalParticipationColumn
            totalBanxTokensSubscribed={totalBanxTokensSubscribed}
            totalBanxSubscribed={totalBanxSubscribed}
            totalPartnerPoints={totalPartnerPoints}
          />

          {wallet.connected && isSubscribed && (
            <WalletParticipationColumn
              status={banxAdventureSubscription?.adventureSubscriptionState}
              banxTokenAmount={formatCompact(
                banxTokenBNToFixed(banxAdventureSubscription.stakeTokensAmount),
              )}
              banxAmount={formatNumbersWithCommas(banxAdventureSubscription.stakeNftAmount)}
              partnerPts={formatNumbersWithCommas(totalWalletPts.toFixed(2))}
            />
          )}

          {!!wallet.connected && !isSubscribed && (
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
