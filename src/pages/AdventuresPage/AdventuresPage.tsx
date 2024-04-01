import { FC } from 'react'

// import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Loader } from '@banx/components/Loader'

import { AdventuresList, Header } from './components'
import { useBanxStakeInfo, useBanxStakeSettings } from './hooks'

import styles from './AdventuresPage.module.less'

export const AdventuresPage: FC = () => {
  // const { connected } = useWallet()

  const { banxStakeSettings, isLoading: isBanxStakeSettingsLoading } = useBanxStakeSettings()
  const { banxStakeInfo, isLoading: isBanxTokenStakeLoading } = useBanxStakeInfo()

  const isLoading = isBanxStakeSettingsLoading || isBanxTokenStakeLoading
  const isDataReady = !!banxStakeInfo && !!banxStakeSettings

  return (
    <div className={styles.pageWrapper}>
      <div className={classNames(styles.content, styles.active)}>
        <Header />
        {isLoading && <Loader className={styles.loader} />}
        {isDataReady && (
          <AdventuresList
            banxStakeInfo={banxStakeInfo}
            banxStakingSettings={banxStakeSettings}
            className={styles.adventuresList}
          />
        )}
      </div>

      {/* {connected && isDataReady && (
        <Sidebar
          banxStakeInfo={banxStakeInfo}
          banxStakingSettings={banxStakeSettings}
          className={styles.sidebar}
        />
      )} */}
    </div>
  )
}
