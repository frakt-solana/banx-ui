import { FC, useEffect } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Loader } from '@banx/components/Loader'

import { BanxAdventure, BanxSubscription } from '@banx/api/banxTokenStake'
import { calculateRewards } from '@banx/pages/AdventuresPage/helpers'
import { useAdventuresInfo } from '@banx/pages/AdventuresPage/hooks'
import { useBanxStakeState } from '@banx/pages/AdventuresPage/state'

import { AdventuresList, Header, Sidebar } from './components'

import styles from './AdventuresPage.module.less'

export const AdventuresPage: FC = () => {
  const { connection } = useConnection()
  const { adventuresInfo, isLoading: adventuresInfoLoading } = useAdventuresInfo()
  const { publicKey } = useWallet()
  const userPubkey = publicKey?.toBase58()
  const {
    banxStake,
    banxTokenSettings,
    loadBanxTokenSettings,
    loadBanxStake,
    loadBanxTokenBalance,
  } = useBanxStakeState()

  useEffect(() => {
    void loadBanxTokenSettings()
    void loadBanxStake({ userPubkey })
    if (publicKey?.toBase58()) {
      void loadBanxTokenBalance({ userPubkey: publicKey, connection })
    }
  }, [
    userPubkey,
    loadBanxTokenSettings,
    loadBanxStake,
    loadBanxTokenBalance,
    connection,
    publicKey,
  ])

  const isLoading = !banxStake || !banxTokenSettings || adventuresInfoLoading
  const isSuccess = !!banxStake && !!banxTokenSettings && !!adventuresInfo

  const adventuresWithSubscriptions =
    banxStake?.banxAdventures.reduce<
      { adventure: BanxAdventure; adventureSubscription: BanxSubscription }[]
    >((acc, { adventure, adventureSubscription }) => {
      if (adventure && adventureSubscription) {
        acc.push({ adventure, adventureSubscription })
      }
      return acc
    }, []) || []

  const rewards = calculateRewards(adventuresWithSubscriptions)

  return (
    <div className={styles.pageWrapper}>
      <div className={classNames(styles.content, styles.active)}>
        <Header />
        {isLoading && <Loader className={styles.loader} />}
        {isSuccess && (
          <AdventuresList
            banxStake={banxStake}
            banxTokenSettings={banxTokenSettings}
            className={styles.adventuresList}
          />
        )}
      </div>

      {!!banxStake?.banxTokenStake && isSuccess && (
        <Sidebar
          rewards={rewards}
          adventuresInfo={adventuresInfo}
          totalClaimed={banxTokenSettings?.rewardsHarvested || 0}
          maxTokenStakeAmount={banxTokenSettings.maxTokenStakeAmount}
          className={styles.sidebar}
          banxTokenStake={banxStake.banxTokenStake}
        />
      )}
    </div>
  )
}
