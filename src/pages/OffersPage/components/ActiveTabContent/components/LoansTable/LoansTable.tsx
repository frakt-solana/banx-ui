import { useMemo, useState } from 'react'

import { first, groupBy, map, sumBy } from 'lodash'

import EmptyList from '@banx/components/EmptyList'
import { SearchSelectProps } from '@banx/components/SearchSelect'
import Table from '@banx/components/Table'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calculateClaimValue, useLenderLoans } from '@banx/pages/OffersPage'
import { ViewState, useTableView } from '@banx/store'
import { formatDecimal, isLoanLiquidated, isLoanTerminating } from '@banx/utils'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useSortedLoans } from './hooks'

import styles from './LoansTable.module.less'

type SearchSelectOption = {
  collectionName: string
  collectionImage: string
  claim: number
}

export const LoansTable = () => {
  const { loans, addMints, updateOrAddLoan, loading } = useLenderLoans()

  const { loansToClaim, loansToTerminate } = useMemo(() => {
    if (!loans.length) return { loansToClaim: [], loansToTerminate: [] }

    const loansToClaim: Loan[] = []

    const loansToTerminate: Loan[] = []

    return { loansToClaim, loansToTerminate }
  }, [loans.length])

  const { viewState } = useTableView()

  const [selectedOffers, setSelectedOffers] = useState<string[]>([])

  const filteredData = useMemo(() => {
    if (selectedOffers.length) {
      return loans.filter(({ nft }) => selectedOffers.includes(nft.meta.collectionName))
    }
    return loans
  }, [loans, selectedOffers])

  const { sortedLoans, sortParams } = useSortedLoans(filteredData)

  const searchSelectOptions = useMemo(() => {
    const loansGroupedByCollection = groupBy(loans, ({ nft }) => nft.meta.collectionName)

    return map(loansGroupedByCollection, (groupedLoans) => {
      const firstLoanInGroup = first(groupedLoans)
      const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.nft.meta || {}
      const claim = sumBy(groupedLoans, calculateClaimValue)

      return { collectionName, collectionImage, claim }
    })
  }, [loans])

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

  if (!loans.length && !loading) return <EmptyList message="Your offer is waiting for a borrower" />

  return (
    <div className={styles.tableRoot}>
      <Table
        data={sortedLoans}
        columns={columns}
        rowParams={rowParams}
        sortViewParams={{ searchSelectParams, sortParams }}
        loading={loading}
      />
      <Summary
        addMints={addMints}
        loansToTerminate={loansToTerminate}
        loansToClaim={loansToClaim}
        updateOrAddLoan={updateOrAddLoan}
      />
    </div>
  )
}
