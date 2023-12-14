import { useOnboardingModal } from '@banx/hooks'
import { useMixpanelLocationTrack } from '@banx/utils'

import RefinanceHeader from './components/RefinanceHeader'
import { RefinanceTable } from './components/RefinanceTable'

import styles from './RefinancePage.module.less'

export const RefinancePage = () => {
  useMixpanelLocationTrack('refinance')
  useOnboardingModal('refinance')

  return (
    <div className={styles.pageWrapper}>
      <RefinanceHeader />
      <RefinanceTable />
    </div>
  )
}
