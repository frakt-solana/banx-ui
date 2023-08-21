import Table from '@banx/components/Table'

import { useBorrowTable } from './hooks'

const BorrowTable = () => {
  const { tableNftData, columns, onRowClick, sortViewParams, isLoading } = useBorrowTable()

  return (
    <Table
      data={tableNftData}
      columns={columns}
      onRowClick={onRowClick}
      sortViewParams={sortViewParams}
      // sortViewParams={sortViewParams}
      // breakpoints={breakpoints}
      // className={className}
      rowKeyField="mint"
      loading={isLoading}
      showCard
    />
  )
}

export default BorrowTable
