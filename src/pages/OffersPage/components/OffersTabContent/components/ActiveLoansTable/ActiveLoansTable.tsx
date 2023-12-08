import { FC, useMemo, useState } from 'react'

import { chain, sumBy } from 'lodash'

import EmptyList from '@banx/components/EmptyList'
import { SearchSelectProps } from '@banx/components/SearchSelect'
import Table from '@banx/components/Table'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { useSortedLoans } from '@banx/pages/LoansPage/components/LoansActiveTable'
import { useLenderLoansAndOffers } from '@banx/pages/OffersPage/hooks'
import { ViewState, useTableView } from '@banx/store'
import { formatDecimal, isLoanLiquidated, isLoanTerminating } from '@banx/utils'

import { useOffersTabContent } from '../../hooks'
import { calculateClaimValue } from '../OfferCard'
import { ActiveTabSummary } from '../Summary/Summary'
import { getTableColumns } from './columns'
import { useSortedLenderLoans } from './hooks/useSortedOffers'

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
  const MAX_TABLE_HEIGHT_PX = 420
  const HEAD_ROW_PX = 30

  return Math.min(ROW_HEIGHT_PX * totalLoans + HEAD_ROW_PX, MAX_TABLE_HEIGHT_PX)
}

type SearchSelectOption = {
  collectionName: string
  collectionImage: string
  claim: number
}

export const ActiveLoansTab = () => {
  const { loans, loansToTerminate, updateOrAddLoan, addMints, loansToClaim } = useOffersTabContent()
  const { viewState } = useTableView()

  const [selectedOffers, setSelectedOffers] = useState<string[]>([])

  const filteredData = useMemo(() => {
    if (selectedOffers.length) {
      return loans.filter(({ nft }) => selectedOffers.includes(nft.meta.collectionName))
    }
    return loans
  }, [loans, selectedOffers])

  const { sortedLoans, sortParams } = useSortedLenderLoans(filteredData)

  const searchSelectOptions = chain(loans)
    .map(({ nft }) => ({
      collectionName: nft.meta.collectionName,
      collectionImage: nft.meta.collectionImage,
      claim: sumBy(loans, calculateClaimValue),
    }))
    .uniqBy(({ collectionName }) => collectionName)
    .value()

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    selectedOptions: selectedOffers,
    className: styles.searchSelect,
    labels: ['Collection', 'Claim'],
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'claim',
        format: (value: number) => createSolValueJSX(value, 1e9, '0◎', formatDecimal),
      },
    },
    onChange: setSelectedOffers,
  }

  const columns = getTableColumns({ updateOrAddLoan, isCardView: viewState === ViewState.CARD })

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

  if (!loans.length) return <EmptyList message="Your offer is waiting for a borrower" />

  return (
    <div className={styles.tableRoot}>
      <Table
        data={sortedLoans}
        columns={columns}
        classNameTableWrapper={styles.tableWrapper}
        rowParams={rowParams}
        sortViewParams={{ searchSelectParams, sortParams }}
        showCard
      />
      <ActiveTabSummary
        addMints={addMints}
        loansToTerminate={loansToTerminate}
        loansToClaim={loansToClaim}
        updateOrAddLoan={updateOrAddLoan}
      />
    </div>
  )
}
