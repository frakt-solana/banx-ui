import { InviteSection } from './components/InviteSection'
import { ReferralCodeSection } from './components/ReferralCodeSection'

import styles from './ReferralTab.module.less'

const ReferralTab = () => {
  return (
    <div className={styles.container}>
      <InviteSection />
      <ReferralCodeSection />
    </div>
  )
}

export default ReferralTab
