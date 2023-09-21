import { FC } from 'react'

import { AdventuresList } from './components/AdventuresList'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { useAdventuresInfo } from './hooks'

import styles from './AdventuresPage.module.less'

export const AdventuresPage: FC = () => {
  const { adventuresInfo, isLoading } = useAdventuresInfo()
  // const walletInfoExists = !!adventuresInfo?.nfts

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.content}>
        <Header />
        {!isLoading && !!adventuresInfo && (
          <AdventuresList
            className={styles.adventuresList}
            adventuresInfo={adventuresInfo}
            // historyMode={tabValue === tabs[1].value}
            historyMode={false}
            setNftsModalOpen={() => null}
          />
        )}
      </div>
      {adventuresInfo?.banxUserPDA && (
        <Sidebar className={styles.sidebar} adventuresInfo={adventuresInfo} />
      )}
    </div>
  )
}
