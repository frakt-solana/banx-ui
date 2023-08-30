import OffersHeader from './components/OffersHeader'
import OffersPageContent from './components/OffersPageContent'

import styles from './OffersPage.module.less'

export const OffersPage = () => {
  return (
    <div className={styles.pageWrapper}>
      <OffersHeader />
      <OffersPageContent />
    </div>
  )
}
