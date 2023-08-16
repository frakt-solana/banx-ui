import { FC } from 'react'

import styles from './ActivityTab.module.less'

interface ActivityTabProps {
  marketPubkey: string
}

const ActivityTab: FC<ActivityTabProps> = () => {
  return <div className={styles.wrapper}></div>
}

export default ActivityTab
