import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { Loan } from '@banx/api/core'
import { useFakeInfinityScroll } from '@banx/hooks'
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

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: loans })

  if (showEmptyList) return <EmptyList {...emptyListParams} />

  return (
    <div className={styles.tableRoot}>
      <div className={styles.tableWrapper}>
        <Table
          data={data}
          columns={columns}
          onRowClick={toggleLoanInSelection}
          sortViewParams={sortViewParams}
          className={styles.table}
          rowKeyField="publicKey"
          loading={loading}
          showCard
          activeRowParams={{
            condition: checkIsTerminationLoan,
            className: styles.termitated,
          }}
        />
        <div ref={fetchMoreTrigger} />
      </div>
      {showSummary && <Summary loans={loans} />}
    </div>
  )
}

const checkIsTerminationLoan = (loan: Loan) => {
  const loanStatus = determineLoanStatus(loan)
  return loanStatus === LoanStatus.Terminating
}
