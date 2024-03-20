import { FC, useEffect } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { sumBy } from 'lodash'

import { Loader } from '@banx/components/Loader'

import { useAdventuresInfo } from '@banx/pages/AdventuresPage/hooks'
import { useBanxStakeState } from '@banx/pages/AdventuresPage/state'

import { AdventuresList } from './components/AdventuresList'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'

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

  const totalStaked =
    sumBy(banxStake?.banxAdventures, (adv) => adv.adventure.totalPartnerPoints) || 0

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
          adventuresInfo={adventuresInfo}
          totalClaimed={banxTokenSettings?.rewardsHarvested || 0}
          totalStaked={totalStaked}
          maxTokenStakeAmount={banxTokenSettings.maxTokenStakeAmount}
          className={styles.sidebar}
          banxTokenStake={banxStake.banxTokenStake}
        />
      )}
    </div>
  )
}
