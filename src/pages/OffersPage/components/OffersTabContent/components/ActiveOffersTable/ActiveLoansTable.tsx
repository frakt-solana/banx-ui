import { FC, useMemo } from 'react'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { Loan } from '@banx/api/core'
import { isLoanLiquidated, isLoanTerminating } from '@banx/utils'

import { EMPTY_LOANS_MESSAGE } from '../../constants'
import { getTableColumns } from './columns'
import { useLenderLoansAndOffers } from './hooks'

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

  if (!loans.length) return <EmptyList message={EMPTY_LOANS_MESSAGE} />

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
