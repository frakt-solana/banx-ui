import { useOnboardingModal } from '@banx/hooks'

import AllocationBlock from './components/AllocationBlock'
import DashboardHeader from './components/DashboardHeader'
import MyLoans from './components/MyLoans'

import styles from './DashboardPage.module.less'

export const DashboardPage = () => {
  useOnboardingModal('dashboard')

  return (
    <div className={styles.pageWrapper}>
      <DashboardHeader />

      <div className={styles.content}>
        <MyLoans />
        <AllocationBlock />
      </div>
    </div>
  )
}
