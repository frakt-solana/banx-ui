import { useMemo } from 'react'

import { useNavigate } from 'react-router-dom'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { PATHS } from '@banx/router'
import { ViewState, useTableView } from '@banx/store'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { EMPTY_MESSAGE } from './constants'
import { useLoansState, useRefinanceTable } from './hooks'

import styles from './RefinanceTable.module.less'

export const RefinanceTable = () => {
  const { loans, sortViewParams, loading, showEmptyList } = useRefinanceTable()
  const navigate = useNavigate()

  const { selectedLoans, onSelectLoan, findSelectedLoan, onSelectLoans, onDeselectAllLoans } =
    useLoansState()

  const { viewState } = useTableView()

  const columns = getTableColumns({
    isCardView: viewState === ViewState.CARD,
    onSelectLoan,
    findSelectedLoan,
  })

  const goToLendPage = () => {
    navigate(PATHS.LEND)
  }

  const rowParams = useMemo(() => {
    return {
      onRowClick: onSelectLoan,
    }
  }, [onSelectLoan])

  if (showEmptyList)
    return (
      <EmptyList
        message={EMPTY_MESSAGE}
        buttonProps={{ text: 'Lend SOL', onClick: goToLendPage }}
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
