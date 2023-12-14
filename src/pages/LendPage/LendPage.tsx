import { useOnboardingModal } from '@banx/hooks'
import { useMixpanelLocationTrack } from '@banx/utils'

import LendHeader from './components/LendHeader'
import LendPageContent from './components/LendPageContent'

import styles from './LendPage.module.less'

export const LendPage = () => {
  useMixpanelLocationTrack('lend')
  useOnboardingModal('lend')

  return (
    <div className={styles.pageWrapper}>
      <LendHeader />
      <LendPageContent />
    </div>
  )
}
