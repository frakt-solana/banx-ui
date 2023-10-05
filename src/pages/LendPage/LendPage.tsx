import LendHeader from './components/LendHeader'
import LendPageContent from './components/LendPageContent'

import styles from './LendPage.module.less'

export const LendPage = () => {
  return (
    <div className={styles.pageWrapper}>
      <LendHeader />
      <LendPageContent />
    </div>
  )
}
