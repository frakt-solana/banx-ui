import { useOnboardingModal } from '@banx/hooks'

import AllocationBlock from './components/AllocationBlock'
import MyLoans from './components/MyLoans/components/MyLoans'
import DashboardHeader from './components/DashboardHeader'
import { useBorrowerStats, useLenderStats } from './hooks'

import styles from './DashboardPage.module.less'

export const DashboardPage = () => {
  useOnboardingModal('dashboard')

  const { data: lenderStats } = useLenderStats()
  const { data: borrowerStats } = useBorrowerStats()

  return (
    <div className={styles.pageWrapper}>
      <DashboardHeader />

      <div className={styles.content}>
        <MyLoans stats={borrowerStats} />
        <AllocationBlock stats={lenderStats} />
      </div>
    </div>
  )
}
