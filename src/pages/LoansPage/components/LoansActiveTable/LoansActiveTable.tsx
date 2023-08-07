import Table, { TableProps } from '@banx/components/Table'

import { Loan } from '@banx/api/loans'

import { useSelectedLoans } from '../../loansState'
import { SearchSelectOption } from '../LoansActiveTab'
import { getTableColumns } from './columns'

import styles from './LoansTable.module.less'

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

  const hasSelectedLoans = !!selection?.length

  const onSelectAll = (): void => {
    if (hasSelectedLoans) {
      clearSelection()
    } else {
      setSelection(data as Loan[])
    }
  }

  const columns = getTableColumns({
    onSelectAll,
    findLoanInSelection,
    toggleLoanInSelection,
    hasSelectedLoans,
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
      showCard
      activeRowParams={{
        field: 'gracePeiod', //! This field doesn't exist, it needs to be added to the backend
        value: true,
        className: styles.gracePeriod,
      }}
    />
  )
}
