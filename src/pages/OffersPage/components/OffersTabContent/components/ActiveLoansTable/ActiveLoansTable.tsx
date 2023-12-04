import { FC, useMemo } from 'react'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { Loan } from '@banx/api/core'
import { useSortedLoans } from '@banx/pages/LoansPage/components/LoansActiveTable/hooks'
import { useLenderLoansAndOffers } from '@banx/pages/OffersPage/hooks'
import { isLoanLiquidated, isLoanTerminating } from '@banx/utils'

import { getTableColumns } from './columns'

import styles from './ActiveLoansTable.module.less'

interface ActiveLoansTableProps {
  loans: Loan[]
}

const ActiveLoansTable: FC<ActiveLoansTableProps> = ({ loans }) => {
  const { updateOrAddLoan } = useLenderLoansAndOffers()
  const sortedLoans = useSortedLoans(loans)

  const columns = getTableColumns({ updateOrAddLoan })

  const rowParams = useMemo(() => {
    return {
      activeRowParams: [
        {
          condition: (loan: Loan) => isLoanTerminating(loan),
          className: styles.terminated,
          cardClassName: styles.terminated,
        },
        {
          condition: (loan: Loan) => isLoanLiquidated(loan),
          className: styles.liquidated,
          cardClassName: styles.liquidated,
        },
      ],
    }
  }, [])

  if (!loans.length)
    return <EmptyList className={styles.emptyList} message="Your offer is waiting for a borrower" />

  return (
    <Table
      styleTableWrapper={{ height: caclulateTableHeight(loans.length) }}
      data={sortedLoans}
      columns={columns}
      classNameTableWrapper={styles.tableWrapper}
      className={styles.tableRoot}
      rowParams={rowParams}
    />
  )
}

export default ActiveLoansTable

//! Sorry :( I haven't really found a better solution on how to implement dynamic height using a virtual table.
const caclulateTableHeight = (totalLoans: number) => {
  const ROW_HEIGHT_PX = 60
  const MAX_TABLE_HEIGHT_PX = 4200
  const HEAD_ROW_PX = 30

  return Math.min(ROW_HEIGHT_PX * totalLoans + HEAD_ROW_PX, MAX_TABLE_HEIGHT_PX)
}
