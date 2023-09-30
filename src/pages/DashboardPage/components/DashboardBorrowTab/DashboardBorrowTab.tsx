import classNames from 'classnames'

import { Loader } from '@banx/components/Loader'

import { SearchableHeading } from '../components'
import AvailableToBorrow from './components/AvailableToBorrow'
import CardList from './components/CardList'
import MyLoans from './components/MyLoans'
import { useDashboardBorrowTab } from './hooks'

import styles from './DashboardBorrowTab.module.less'

const DashboardBorrowTab = () => {
  const { searchSelectParams, borrowerStats, loading, headingText, isConnected } =
    useDashboardBorrowTab()

  return (
    <>
      <div className={styles.nftsSection}>
        <SearchableHeading title={headingText} searchSelectParams={searchSelectParams} />
        {loading ? <Loader /> : <CardList />}
      </div>
      <div className={classNames(styles.additionalSection, { [styles.fixedHeight]: !isConnected })}>
        <AvailableToBorrow />
        {isConnected && <MyLoans stats={borrowerStats} />}
      </div>
    </>
  )
}

export default DashboardBorrowTab
