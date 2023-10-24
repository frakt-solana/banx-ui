import classNames from 'classnames'

import { Loader } from '@banx/components/Loader'

import { SearchableHeading } from '../components'
import AvailableToBorrow from './components/AvailableToBorrow'
import CardsList from './components/CardsList'
import MyLoans from './components/MyLoans'
import { useDashboardBorrowTab } from './hooks'

import styles from './DashboardBorrowTab.module.less'

const DashboardBorrowTab = () => {
  const {
    searchSelectParams,
    borrowerStats,
    loading,
    headingText,
    isConnected,
    borrow,
    findBestOffer,
    nfts,
    marketsPreview,
    goToBorrowPage,
  } = useDashboardBorrowTab()

  return (
    <>
      <div className={styles.nftsSection}>
        <SearchableHeading title={headingText} searchSelectParams={searchSelectParams} />
        {loading ? (
          <Loader />
        ) : (
          <CardsList
            nfts={nfts}
            marketsPreview={marketsPreview}
            borrow={borrow}
            findBestOffer={findBestOffer}
            goToBorrowPage={goToBorrowPage}
          />
        )}
      </div>
      <div className={classNames(styles.additionalSection, { [styles.fixedHeight]: !isConnected })}>
        <AvailableToBorrow />
        {isConnected && <MyLoans stats={borrowerStats} />}
      </div>
    </>
  )
}

export default DashboardBorrowTab
