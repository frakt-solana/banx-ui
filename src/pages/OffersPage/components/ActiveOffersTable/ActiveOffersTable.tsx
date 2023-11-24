import { FC, useMemo } from 'react'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { Loan } from '@banx/api/core'
import { isLoanLiquidated, isLoanTerminating } from '@banx/utils'

import { getTableColumns } from './columns'
import { EMPTY_MESSAGE } from './constants'
import { useLenderLoansAndOffers } from './hooks'

import styles from './ActiveOffersTable.module.less'

interface ActiveOffersTableProps {
  loans: Loan[]
}

const ActiveOffersTable: FC<ActiveOffersTableProps> = ({ loans }) => {
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

  if (!loans.length) return <EmptyList message={EMPTY_MESSAGE} />

  return <Table data={loans} columns={columns} className={styles.rootTable} rowParams={rowParams} />
}

export default ActiveOffersTable
