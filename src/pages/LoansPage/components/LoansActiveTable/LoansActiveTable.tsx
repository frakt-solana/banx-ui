import Table from '@banx/components/Table'

import { Loan } from '@banx/api/core'
import { ViewState, useTableView } from '@banx/store'

import { useSelectedLoans } from '../../loansState'
import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useLoansActiveTab } from './hooks'

import styles from './LoansActiveTable.module.less'

export const LoansActiveTable = () => {
  const { sortViewParams, loans, loading } = useLoansActiveTab()

  const { selection, toggleLoanInSelection, findLoanInSelection, clearSelection, setSelection } =
    useSelectedLoans()

  const hasSelectedLoans = !!selection?.length

  const { viewState } = useTableView()

  const onSelectAll = (): void => {
    if (hasSelectedLoans) {
      clearSelection()
    } else {
      setSelection(loans as Loan[])
    }
  }

  const columns = getTableColumns({
    onSelectAll,
    findLoanInSelection,
    toggleLoanInSelection,
    hasSelectedLoans,
    isCardView: viewState === ViewState.CARD,
  })

  return (
    <div className={styles.tableRoot}>
      <div className={styles.tableWrapper}>
        <Table
          data={loans}
          columns={columns}
          onRowClick={toggleLoanInSelection}
          sortViewParams={sortViewParams}
          rowKeyField="publicKey"
          loading={loading}
          showCard
          activeRowParams={{
            field: 'fraktBond.terminatedCounter',
            value: true,
            className: styles.termitated,
          }}
        />
      </div>
      <Summary />
    </div>
  )
}
