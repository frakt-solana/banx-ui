import BorrowHeader from './components/BorrowHeader'
import BorrowTable from './components/BorrowTable'

import styles from './BorrowPage.module.less'

export const BorrowPage = () => {
  return (
    <div className={styles.pageWrapper}>
      <BorrowHeader />
      <BorrowTable />
    </div>
  )
}
