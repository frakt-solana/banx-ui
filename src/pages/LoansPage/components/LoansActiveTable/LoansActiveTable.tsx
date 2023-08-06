import { FC } from 'react'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import Table, { SortParams } from '@banx/components/Table'

import { getTableColumns } from './columns'

export interface LoansActiveTableProps {
  data: ReadonlyArray<any>
  loading?: boolean
  className?: string
  searchSelectParams: SearchSelectProps<any>
  sortParams: SortParams
}

export const LoansActiveTable: FC<LoansActiveTableProps> = ({
  data,
  sortParams,
  searchSelectParams,
}) => {
  const columns = getTableColumns() as any

  return (
    <Table
      data={data}
      columns={columns}
      sortParams={sortParams}
      searchSelectParams={searchSelectParams}
    />
  )
}
