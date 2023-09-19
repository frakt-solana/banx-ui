import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { Loan } from '@banx/api/core'
import { useFakeInfinityScroll } from '@banx/hooks'
import { ViewState, useTableView } from '@banx/store'
import { LoanStatus, determineLoanStatus } from '@banx/utils'

import { Summary, showSummary } from './Summary'
import { getTableColumns } from './columns'
import { useActiveOffersTable } from './hooks'

import styles from './ActiveOffersTable.module.less'

const ActiveOffersTable = () => {
  const { loans, sortViewParams, loading, showEmptyList, emptyListParams } = useActiveOffersTable()

  const { viewState } = useTableView()
  const isCardView = viewState === ViewState.CARD

  const columns = getTableColumns({ isCardView })

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: loans })

  if (showEmptyList) return <EmptyList {...emptyListParams} />

  return (
    <div className={styles.tableRoot}>
      <Table
        data={data}
        columns={columns}
        sortViewParams={sortViewParams}
        className={styles.rootTable}
        rowKeyField="publicKey"
        activeRowParams={[
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
        ]}
        loading={loading}
        showCard
      />
      <div ref={fetchMoreTrigger} />
      {showSummary(loans) && <Summary loans={loans} />}
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
