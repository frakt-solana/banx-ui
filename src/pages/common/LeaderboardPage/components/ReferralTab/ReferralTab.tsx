import { ReferralCodeSection } from './components/ReferralCodeSection'
import { ReferralInfoSection } from './components/ReferralInfoSection'

import styles from './ReferralTab.module.less'

const ReferralTab = () => {
  return (
    <div className={styles.container}>
      <ReferralCodeSection />
      <ReferralInfoSection />
    </div>
  )
}

export default ReferralTab
