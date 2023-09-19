import RefinanceHeader from './components/RefinanceHeader'
import { RefinanceTable } from './components/RefinanceTable'

import styles from './RefinancePage.module.less'

export const RefinancePage = () => {
  return (
    <div className={styles.pageWrapper}>
      <RefinanceHeader />
      <RefinanceTable />
    </div>
  )
}
