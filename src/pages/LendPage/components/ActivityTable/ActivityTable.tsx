import { FC } from 'react'

import Table from '@banx/components/Table'

import { useLenderActivity } from '@banx/pages/OffersPage/components/HistoryOffersTable/hooks/useLenderActivity'

import { FilterTableSection } from './FilterTableSection'
import { getTableColumns } from './columns'

import styles from './ActivityTable.module.less'

interface ActivityTableProps {
  marketPubkey: string
}

const ActivityTable: FC<ActivityTableProps> = () => {
  const { loans, isLoading } = useLenderActivity()

  const columns = getTableColumns()

  return (
    <>
      <FilterTableSection />
      <Table
        data={loans}
        columns={columns}
        className={styles.rootTable}
        rowKeyField="publicKey"
        loading={isLoading}
      />
    </>
  )
}

export default ActivityTable
