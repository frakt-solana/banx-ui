import { FC, useMemo } from 'react'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { Loan } from '@banx/api/core'
import { useLenderLoansAndOffers } from '@banx/pages/OffersPage/hooks'
import { isLoanLiquidated, isLoanTerminating } from '@banx/utils'

import { getTableColumns } from './columns'

import styles from './ActiveLoansTable.module.less'

interface ActiveLoansTableProps {
  loans: Loan[]
}

const ActiveLoansTable: FC<ActiveLoansTableProps> = ({ loans }) => {
  const { offers, updateOrAddLoan, updateOrAddOffer } = useLenderLoansAndOffers()

  const columns = getTableColumns({ offers, updateOrAddOffer, updateOrAddLoan })

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
      data={loans}
      columns={columns}
      classNameTableWrapper={styles.tableWrapper}
      className={styles.tableRoot}
      rowParams={rowParams}
    />
  )
}

export default ActiveLoansTable
