import { FC } from 'react'

import classNames from 'classnames'

import { Loader } from '@banx/components/Loader'

import { useAdventuresInfo } from '@banx/pages/AdventuresPage/hooks'
import { useBanxTokenSettings } from '@banx/pages/AdventuresPage/hooks/useBanxTokenSettings'
import { useBanxTokenStake } from '@banx/pages/AdventuresPage/hooks/useBanxTokenStake'

import { AdventuresList } from './components/AdventuresList'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'

import styles from './AdventuresPage.module.less'

export const AdventuresPage: FC = () => {
  const { banxStake, isLoading: banxTokenStakeLoading } = useBanxTokenStake()
  const { banxTokenSettings, isLoading: banxTokenSettingsLoading } = useBanxTokenSettings()
  const { adventuresInfo, isLoading: adventuresInfoLoading } = useAdventuresInfo()
  console.log({ banxTokenSettings, banxStake, adventuresInfo })

  const isLoading = banxTokenSettingsLoading || banxTokenStakeLoading || adventuresInfoLoading
  const isSuccess = !!banxStake && !!banxTokenSettings && !!adventuresInfo

  const totalStaked =
    banxStake?.banxAdventures.reduce((acc, adv) => acc + adv.banxAdventure.totalPartnerPoints, 0) ||
    0

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

      {isSuccess && (
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
