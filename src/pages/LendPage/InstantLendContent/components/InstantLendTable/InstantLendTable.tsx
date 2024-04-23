import { useMemo } from 'react'

import { useNavigate } from 'react-router-dom'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { PATHS } from '@banx/router'
import { ViewState, createPathWithTokenParam, useTableView, useTokenType } from '@banx/store'
import { isSolTokenType } from '@banx/utils'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useInstantLendTable } from './hooks'
import { useLoansState } from './loansState'

import styles from './InstantLendTable.module.less'

export const InstantLendTable = () => {
  const navigate = useNavigate()
  const { tokenType } = useTokenType()
  const { viewState } = useTableView()

  const { loans, sortViewParams, loading, showEmptyList } = useInstantLendTable()

  const { selectedLoans, onSelectLoan, findSelectedLoan, onSelectLoans, onDeselectAllLoans } =
    useLoansState()

  const hasSelectedLoans = !!selectedLoans.length
  const onSelectAll = () => {
    if (hasSelectedLoans) {
      onDeselectAllLoans()
    } else {
      onSelectLoans(loans)
    }
  }

  const columns = getTableColumns({
    isCardView: viewState === ViewState.CARD,
    onSelectLoan,
    findSelectedLoan,
    onSelectAll,
    hasSelectedLoans,
  })

  const goToLendPage = () => {
    navigate(createPathWithTokenParam(PATHS.LEND, tokenType))
  }

  const rowParams = useMemo(() => {
    return {
      onRowClick: onSelectLoan,
    }
  }, [onSelectLoan])

  const emptyButtonText = isSolTokenType(tokenType) ? 'Lend SOL' : 'Lend USDC'

  if (showEmptyList)
    return (
      <EmptyList
        message="No offers to refinance. Create an offer if you want to fund some loans"
        buttonProps={{ text: emptyButtonText, onClick: goToLendPage }}
      />
    )

  return (
    <div className={styles.tableRoot}>
      <Table
        data={loans}
        columns={columns}
        className={styles.refinanceTable}
        rowParams={rowParams}
        sortViewParams={sortViewParams}
        loading={loading}
        showCard
      />
      <Summary
        loans={loans}
        selectedLoans={selectedLoans}
        onSelectLoans={onSelectLoans}
        onDeselectAllLoans={onDeselectAllLoans}
      />
    </div>
  )
}
