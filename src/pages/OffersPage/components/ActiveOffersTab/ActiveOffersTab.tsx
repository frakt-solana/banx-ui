import ActiveOffersTable from '../ActiveOffersTable'
import { useActiveOffersTab } from './hooks'

import styles from './ActiveOffersTab.module.less'

const ActiveOffersTab = () => {
  const { loans, sortViewParams } = useActiveOffersTab()

  return (
    <ActiveOffersTable className={styles.rootTable} data={loans} sortViewParams={sortViewParams} />
  )
}

export default ActiveOffersTab
