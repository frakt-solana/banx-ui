import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { staking } from 'fbonds-core/lib/fbond-protocol/functions'
import { Adventure, BanxUser } from 'fbonds-core/lib/fbond-protocol/types'
import { capitalize } from 'lodash'

import { AdventureNft, AdventureStatus, AdventuresInfo } from '@banx/api/adventures'
import {
  BanxAdventure,
  BanxStake,
  BanxStakeSettings,
  BanxSubscription,
} from '@banx/api/banxTokenStake'
import { TOTAL_BANX_NFTS, TOTAL_BANX_PTS } from '@banx/constants'
import { useModal } from '@banx/store'
import { getAdventureStatus } from '@banx/transactions/adventures'
import { formatCompact, formatNumbersWithCommas } from '@banx/utils'

import { AdventuresModal } from '../AdventuresModal'
import {
  AdventureSubscribeButton,
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
    !!banxSubscription?.stakeTokensAmount ||
    !!banxSubscription?.stakeNftAmount ||
    !!banxSubscription?.stakePartnerPointsAmount

  const totalBanxSubscribed = `${format(banxAdventure.totalBanxSubscribed)}/${format(
    TOTAL_BANX_NFTS,
  )}`
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
              banxTokenAmount={format(banxSubscription.stakeTokensAmount)}
              banxAmount={format(banxSubscription.stakeNftAmount)}
              partnerPts={banxSubscription.stakePartnerPointsAmount}
            />
          )}

          {!isParticipating && walletConnected && (
            <NotParticipatedColumn status={AdventureStatus.LIVE} />
          )}
        </div>

        {walletConnected && (
          <div className={styles.statusAndBtnWrapper}>
            <AdventureSubscribeButton />
          </div>
        )}
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
      {banxStake.banxAdventures.map(({ banxAdventure, subscription }) => (
        <AdventuresCard
          banxSubscription={subscription}
          banxAdventure={banxAdventure}
          key={banxAdventure?.publicKey}
          walletConnected={connected}
          maxTokenStakeAmount={banxTokenSettings.maxTokenStakeAmount}
        />
      ))}
    </ul>
  )
}
