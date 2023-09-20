import { FC, useEffect } from 'react'

import Table from '@banx/components/Table'

import { useIntersection } from '@banx/hooks'

import { FilterTableSection } from './FilterTableSection'
import { getTableColumns } from './columns'
import { useAllLenderActivity } from './hooks'

import styles from './ActivityTable.module.less'

interface ActivityTableProps {
  marketPubkey: string
}

const ActivityTable: FC<ActivityTableProps> = () => {
  const { ref: fetchMoreTrigger, inView } = useIntersection()

  const { loans, isLoading, fetchNextPage, hasNextPage, filterParams } = useAllLenderActivity()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  const columns = getTableColumns()

  return (
    <>
      <FilterTableSection {...filterParams} />
      <Table
        data={loans}
        columns={columns}
        rowKeyField="publicKey"
        classNameTableWrapper={styles.tableWrapper}
        fetchMoreTrigger={fetchMoreTrigger}
        loading={isLoading}
      />
    </>
  )
}

export default ActivityTable
