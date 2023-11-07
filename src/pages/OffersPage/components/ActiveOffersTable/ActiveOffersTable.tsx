import { useMemo } from 'react'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/TableVirtual'

import { Loan } from '@banx/api/core'
import { ViewState, useTableView } from '@banx/store'
import { LoanStatus, determineLoanStatus } from '@banx/utils'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useActiveOffersTable } from './hooks'

import styles from './ActiveOffersTable.module.less'

const ActiveOffersTable = () => {
  const {
    loans,
    sortViewParams,
    loading,
    showEmptyList,
    emptyListParams,
    updateOrAddLoan,
    loansToClaim,
    loansToTerminate,
    addMints,
  } = useActiveOffersTable()

  const { viewState } = useTableView()
  const isCardView = viewState === ViewState.CARD

  const columns = getTableColumns({ isCardView })

  const rowParams = useMemo(() => {
    return {
      activeRowParams: [
        {
          condition: checkIsTerminationLoan,
          className: styles.terminated,
          cardClassName: styles.terminated,
        },
        {
          condition: checkIsLiquidatedLoan,
          className: styles.liquidated,
          cardClassName: styles.liquidated,
        },
      ],
    }
  }, [])

  if (showEmptyList) return <EmptyList {...emptyListParams} />

  return (
    <div className={styles.tableRoot}>
      <Table
        data={loans}
        columns={columns}
        sortViewParams={sortViewParams}
        className={styles.rootTable}
        rowParams={rowParams}
        loading={loading}
        showCard
      />
      <Summary
        loansToClaim={loansToClaim}
        loansToTerminate={loansToTerminate}
        updateOrAddLoan={updateOrAddLoan}
        addMints={addMints}
      />
    </div>
  )
}

export default ActiveOffersTable

const checkIsTerminationLoan = (loan: Loan) => {
  const loanStatus = determineLoanStatus(loan)
  return loanStatus === LoanStatus.Terminating
}

const checkIsLiquidatedLoan = (loan: Loan) => {
  const loanStatus = determineLoanStatus(loan)
  return loanStatus === LoanStatus.Liquidated
}
