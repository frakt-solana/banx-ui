import ActiveOffersTable from '../ActiveOffersTable'
import { useActiveOffersTab } from './hooks'

import styles from './ActiveOffersTab.module.less'

const ActiveOffersTab = () => {
  const { loans, sortViewParams, loading } = useActiveOffersTab()

  return (
    <ActiveOffersTable
      data={loans}
      loading={loading}
      sortViewParams={sortViewParams}
      className={styles.rootTable}
    />
  )
}

export default ActiveOffersTab
