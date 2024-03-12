import {FC} from 'react'

import classNames from 'classnames'

import { Loader } from '@banx/components/Loader'
import { useBanxTokenStake } from '@banx/pages/AdventuresPage/hooks/useBanxTokenStake'

import { AdventuresList } from './components/AdventuresList'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'

import styles from './AdventuresPage.module.less'
import {useBanxTokenSettings} from "@banx/pages/AdventuresPage/hooks/useBanxTokenSettings";

export const AdventuresPage: FC = () => {
  const { banxStake, isLoading: banxTokenStakeLoading } = useBanxTokenStake()
  const { banxTokenSettings, isLoading: banxTokenSettingsLoading} = useBanxTokenSettings()

  console.log({banxTokenSettings, banxStake})

  const isLoading = banxTokenSettingsLoading || banxTokenStakeLoading
  const isSuccess = !!banxStake && !!banxTokenSettings

  const totalStaked = banxStake?.banxAdventures.reduce((acc, adv) => (
    acc + adv.banxAdventure.totalPartnerPoints
  ), 0) || 0


  return (
    <div className={styles.pageWrapper}>
      <div className={classNames(styles.content, { [styles.active]: false })}>
        <Header />
        {isLoading && <Loader className={styles.loader} />}
        {!isLoading && isSuccess && (
          <>
            <AdventuresList
              banxStake={banxStake}
              banxTokenSettings={banxTokenSettings}
              className={styles.adventuresList}
            />
          </>
        )}
      </div>

      {/*<StakeTokens/>*/}


      {isSuccess && (
        <Sidebar
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

