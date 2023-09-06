import Table from '@banx/components/Table'

import { useFakeInfinityScroll } from '@banx/hooks'

import { Summary } from './Summary'
import { useBorrowTable } from './hooks'

import styles from './BorrowTable.module.less'

const BorrowTable = () => {
  const { tableNftData, columns, onRowClick, sortViewParams, isLoading } = useBorrowTable()

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: tableNftData })

  return (
    <div className={styles.tableRoot}>
      <div className={styles.tableWrapper}>
        <Table
          data={data}
          columns={columns}
          onRowClick={onRowClick}
          sortViewParams={sortViewParams}
          className={styles.borrowTable}
          rowKeyField="mint"
          loading={isLoading}
          showCard
        />
        <div ref={fetchMoreTrigger} />
      </div>
      <Summary />
    </div>
  )
}

export default BorrowTable
