import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/TableVirtual'

import { Loan } from '@banx/api/core'
import { ViewState, useTableView } from '@banx/store'
import { LoanStatus, determineLoanStatus } from '@banx/utils'

import { useSelectedLoans } from '../../loansState'
import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useLoansActiveTable } from './hooks'

import styles from './LoansActiveTable.module.less'

export const LoansActiveTable = () => {
  const { sortViewParams, loans, loading, showEmptyList, emptyListParams, showSummary } =
    useLoansActiveTable()

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

  if (showEmptyList) return <EmptyList {...emptyListParams} />

  return (
    <div className={styles.tableRoot}>
      <Table
        data={loans}
        columns={columns}
        onRowClick={toggleLoanInSelection}
        sortViewParams={sortViewParams}
        className={styles.table}
        rowKeyField="publicKey"
        loading={loading}
        showCard
        activeRowParams={[
          {
            condition: checkIsTerminationLoan,
            className: styles.terminated,
            cardClassName: styles.terminated,
          },
        ]}
      />
      {showSummary && <Summary loans={loans} />}
    </div>
  )
}

const checkIsTerminationLoan = (loan: Loan) => {
  const loanStatus = determineLoanStatus(loan)
  return loanStatus === LoanStatus.Terminating
}
