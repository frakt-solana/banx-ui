import { Button } from '@banx/components/Buttons'
import Table from '@banx/components/Table'

import { useBorrowTable } from './hooks'

const BorrowTable = () => {
  const { tableNftData, columns, onRowClick, sortViewParams, isLoading, borrowAll } =
    useBorrowTable()

  return (
    <>
      <Button onClick={borrowAll}>Borrow bulk</Button>

      <Table
        data={tableNftData}
        columns={columns}
        onRowClick={onRowClick}
        sortViewParams={sortViewParams}
        // breakpoints={breakpoints}
        // className={className}
        rowKeyField="mint"
        loading={isLoading}
        showCard
      />
    </>
  )
}

export default BorrowTable
