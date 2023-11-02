import { useNavigate } from 'react-router-dom'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { useFakeInfinityScroll } from '@banx/hooks'
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

  const { selectedLoans, onSelectLoan, findSelectedLoan, onSelectAllLoans, onDeselectAllLoans } =
    useLoansState()

  const { viewState } = useTableView()

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: loans })

  const columns = getTableColumns({
    isCardView: viewState === ViewState.CARD,
    onSelectLoan,
    findSelectedLoan,
  })

  const goToLendPage = () => {
    navigate(PATHS.LEND)
  }

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
        data={data}
        columns={columns}
        className={styles.refinanceTable}
        onRowClick={onSelectLoan}
        sortViewParams={sortViewParams}
        rowKeyField="publicKey"
        loading={loading}
        showCard
        fetchMoreTrigger={fetchMoreTrigger}
      />
      <Summary
        selectedLoans={selectedLoans}
        onSelectAllLoans={() => onSelectAllLoans(loans)}
        onDeselectAllLoans={onDeselectAllLoans}
      />
    </div>
  )
}
