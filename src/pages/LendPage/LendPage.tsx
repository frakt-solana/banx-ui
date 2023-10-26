import { useMixpanelLocationTrack } from '@banx/utils'

import LendHeader from './components/LendHeader'
import LendPageContent from './components/LendPageContent'

import styles from './LendPage.module.less'

export const LendPage = () => {
  useMixpanelLocationTrack('lend')

  return (
    <div className={styles.pageWrapper}>
      <LendHeader />
      <LendPageContent />
    </div>
  )
}
