import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { useFakeInfinityScroll } from '@banx/hooks'
import { PATHS } from '@banx/router'
import { ViewState, useTableView } from '@banx/store'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { EMPTY_MESSAGE } from './constants'
import { useRefinanceTable } from './hooks'

import styles from './RefinanceTable.module.less'

export const RefinanceTable = () => {
  const {
    loans,
    sortViewParams,
    loading,
    showEmptyList,
    selectedLoans,
    onSelectLoan,
    onSelectAllLoans,
    onDeselectAllLoans,
    findSelectedLoan,
  } = useRefinanceTable()

  const { viewState } = useTableView()

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: loans })

  const columns = getTableColumns({
    isCardView: viewState === ViewState.CARD,
    onSelectLoan,
    findSelectedLoan,
  })

  if (showEmptyList)
    return <EmptyList message={EMPTY_MESSAGE} buttonText="Lend SOL" path={PATHS.LEND} />

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
      />
      <div ref={fetchMoreTrigger} />
      <Summary
        selectedLoans={selectedLoans}
        onSelectAllLoans={onSelectAllLoans}
        onDeselectAllLoans={onDeselectAllLoans}
      />
    </div>
  )
}
