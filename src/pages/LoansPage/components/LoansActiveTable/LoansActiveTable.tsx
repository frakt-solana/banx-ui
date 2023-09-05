import Table from '@banx/components/Table'

import { ViewState, useTableView } from '@banx/store'

import { useSelectedLoans } from '../../loansState'
import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useLoansActiveTable } from './hooks'

import styles from './LoansActiveTable.module.less'

export const LoansActiveTable = () => {
  const { sortViewParams, loans, loading } = useLoansActiveTable()

  const { selection, toggleLoanInSelection, findLoanInSelection, clearSelection, setSelection } =
    useSelectedLoans()

  const hasSelectedLoans = !!selection?.length

  const { viewState } = useTableView()

  const onSelectAll = (): void => {
    if (hasSelectedLoans) {
      clearSelection()
    } else {
      setSelection(loans)
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
          className={styles.table}
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
      <Summary loans={loans} />
    </div>
  )
}
