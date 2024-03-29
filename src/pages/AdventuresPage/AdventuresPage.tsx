import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import moment from 'moment'

import { Loader } from '@banx/components/Loader'

import { BanxAdventure, BanxSubscription } from '@banx/api/staking'
import { calculateRewards } from '@banx/pages/AdventuresPage/helpers'

import { AdventuresList, Header, Sidebar } from './components'
import { useBanxStakeSettings, useStakeInfo } from './hooks'

import styles from './AdventuresPage.module.less'

export const AdventuresPage: FC = () => {
  const { publicKey } = useWallet()
  const userPubkey = publicKey?.toBase58()

  const { banxTokenSettings, isLoading: isBanxTokenSettingsLoading } = useBanxStakeSettings()
  const { banxStake, isLoading: isBanxTokenStakeLoading } = useStakeInfo()

  const isLoading = isBanxTokenSettingsLoading || isBanxTokenStakeLoading
  const isDataReady = !!banxStake && !!banxTokenSettings

  const adventuresWithSubscriptions =
    banxStake?.banxAdventures
      .filter(({ adventure }) => parseInt(adventure.periodEndingAt) < moment().unix())
      .reduce<{ adventure: BanxAdventure; adventureSubscription: BanxSubscription }[]>(
        (acc, { adventure, adventureSubscription }) => {
          if (adventure && adventureSubscription) {
            acc.push({ adventure, adventureSubscription })
          }
          return acc
        },
        [],
      ) || []

  const rewards = calculateRewards(adventuresWithSubscriptions)

  return (
    <div className={styles.pageWrapper}>
      <div className={classNames(styles.content, styles.active)}>
        <Header />
        {isLoading && <Loader className={styles.loader} />}
        {isDataReady && (
          <AdventuresList
            banxStake={banxStake}
            banxTokenSettings={banxTokenSettings}
            className={styles.adventuresList}
          />
        )}
      </div>

      {!!userPubkey && !!banxStake?.banxTokenStake && isDataReady && (
        <Sidebar
          tokensPerPartnerPoints={banxTokenSettings.tokensPerPartnerPoints}
          rewards={rewards}
          totalClaimed={banxTokenSettings?.rewardsHarvested || '0'}
          nftsCount={banxStake?.nfts?.length.toString() || '0'}
          className={styles.sidebar}
          banxTokenStake={banxStake.banxTokenStake}
        />
      )}
    </div>
  )
}
