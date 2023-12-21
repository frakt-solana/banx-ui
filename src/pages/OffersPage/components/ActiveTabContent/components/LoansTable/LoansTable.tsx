import { useMemo, useState } from 'react'

import { first, groupBy, map, sumBy } from 'lodash'

import EmptyList from '@banx/components/EmptyList'
import { SearchSelectProps } from '@banx/components/SearchSelect'
import Table from '@banx/components/Table'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import {
  calculateClaimValue,
  isLoanAbleToClaim,
  isLoanAbleToTerminate,
  useLenderLoans,
} from '@banx/pages/OffersPage'
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
  const { loans, addMints: hideLoans, updateOrAddLoan, loading } = useLenderLoans()

  const { loansToClaim, loansToTerminate } = useMemo(() => {
    if (!loans.length) return { loansToClaim: [], loansToTerminate: [] }

    const loansToClaim = loans.filter(isLoanAbleToClaim)

    const loansToTerminate = loans.filter(isLoanAbleToTerminate)

    return { loansToClaim, loansToTerminate }
  }, [loans])

  const { viewState } = useTableView()

  const [selectedCollections, setSelectedCollections] = useState<string[]>([])

  const filteredLoans = useMemo(() => {
    if (selectedCollections.length) {
      return loans.filter(({ nft }) => selectedCollections.includes(nft.meta.collectionName))
    }
    return loans
  }, [loans, selectedCollections])

  const { sortedLoans, sortParams } = useSortedLoans(filteredLoans)

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
    selectedOptions: selectedCollections,
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
    onChange: setSelectedCollections,
  }

  const columns = getTableColumns({ isCardView: viewState === ViewState.CARD })

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

  if (!loans.length && !loading)
    return <EmptyList message="Your offers is waiting for a borrower" />

  return (
    <div className={styles.tableRoot}>
      <Table
        data={sortedLoans}
        columns={columns}
        rowParams={rowParams}
        sortViewParams={{ searchSelectParams, sortParams }}
        loading={loading}
        showCard
      />
      <Summary
        hideLoans={hideLoans}
        loansToTerminate={loansToTerminate}
        loansToClaim={loansToClaim}
        updateOrAddLoan={updateOrAddLoan}
      />
    </div>
  )
}
