import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { capitalize } from 'lodash'

import { AdventureStatus } from '@banx/api/adventures'
import {
  BanxAdventure,
  BanxStake,
  BanxStakeSettings,
  BanxSubscription,
} from '@banx/api/banxTokenStake'
import { TOTAL_BANX_NFTS, TOTAL_BANX_PTS } from '@banx/constants'
import { fromDecimals } from '@banx/pages/AdventuresPage/helpers'
import { formatCompact, formatNumbersWithCommas } from '@banx/utils'

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
  const format = formatNumbersWithCommas
  const isEnded = banxAdventure.periodEndingAt * 1000 < Date.now()

  const isParticipating =
    !!banxSubscription?.stakeTokensAmount || !!banxSubscription?.stakeNftAmount

  const totalBanxSubscribed = `${format(fromDecimals(banxAdventure.totalBanxSubscribed))}/${format(
    TOTAL_BANX_NFTS,
  )}`
  const totalBanxTokensSubscribed = `${formatCompact(
    banxAdventure.totalTokensStaked,
  )}/${formatCompact(maxTokenStakeAmount)}`
  const totalPartnerPoints = `${formatCompact(
    fromDecimals(banxAdventure.totalPartnerPoints),
  )}/${format(TOTAL_BANX_PTS)}`

  const status = useMemo(() => {
    if (isEnded) {
      return AdventureStatus.ENDED
    }

    return AdventureStatus.LIVE
  }, [isEnded])

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

          {!isParticipating && walletConnected && (
            <NotParticipatedColumn status={AdventureStatus.LIVE} />
          )}
        </div>
      </div>
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
