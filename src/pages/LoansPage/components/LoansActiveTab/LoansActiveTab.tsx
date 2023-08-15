import { LoansActiveTable } from '../LoansActiveTable'
import { useLoansActiveTab } from './hooks/useLoansActiveTab'

import styles from './LoansActiveTable.module.less'

const LoansActiveTab = () => {
  const { sortViewParams, loans, loading } = useLoansActiveTab()

  return (
    <LoansActiveTable
      className={styles.rootTable}
      data={loans}
      loading={loading}
      sortViewParams={sortViewParams}
    />
  )
}

export default LoansActiveTab
