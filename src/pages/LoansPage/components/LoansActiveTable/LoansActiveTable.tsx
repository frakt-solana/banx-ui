import Table, { TableProps } from '@banx/components/Table'

import { Loan } from '@banx/api/loans'

import { useSelectedLoans } from '../../loansState'
import { SearchSelectOption } from '../LoansActiveTab'
import { getTableColumns } from './columns'

type TableViewProps<T, P> = Omit<TableProps<T, P>, 'columns' | 'onRowClick'>

export const LoansActiveTable = ({
  data,
  sortViewParams,
  breakpoints,
  className,
  loading,
}: TableViewProps<Loan, SearchSelectOption>) => {
  const { selection, toggleLoanInSelection, findLoanInSelection, clearSelection, setSelection } =
    useSelectedLoans()

  const hasSelectedLoan = !!selection?.length

  const onSelectAll = (): void => {
    if (hasSelectedLoan) {
      clearSelection()
    } else {
      setSelection(data as Loan[])
    }
  }

  const columns = getTableColumns({
    onSelectAll,
    findLoanInSelection,
    toggleLoanInSelection,
    hasSelectedLoan,
  })

  return (
    <Table
      data={data}
      columns={columns}
      onRowClick={toggleLoanInSelection}
      sortViewParams={sortViewParams}
      breakpoints={breakpoints}
      className={className}
      loading={loading}
    />
  )
}
