import { useFakeInfinityScroll } from '@banx/components/InfinityScroll'
import Table from '@banx/components/Table'

import { ViewState, useTableView } from '@banx/store'

import { useSelectedLoans } from '../../loansState'
import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useLoansActiveTable } from './hooks'

import styles from './LoansActiveTable.module.less'

export const LoansActiveTable = () => {
  const { sortViewParams, loans, loading } = useLoansActiveTable()

  const { selection, toggleLoanInSelection, findLoanInSelection, clearSelection, setSelection } =
    useSelectedLoans()

  const hasSelectedLoans = !!selection?.length

  const { viewState } = useTableView()

  const onSelectAll = (): void => {
    if (hasSelectedLoans) {
      clearSelection()
    } else {
      setSelection(loans)
    }
  }

  const columns = getTableColumns({
    onSelectAll,
    findLoanInSelection,
    toggleLoanInSelection,
    hasSelectedLoans,
    isCardView: viewState === ViewState.CARD,
  })

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: loans })

  return (
    <div className={styles.tableRoot}>
      <div className={styles.tableWrapper}>
        <Table
          data={data}
          columns={columns}
          onRowClick={toggleLoanInSelection}
          sortViewParams={sortViewParams}
          rowKeyField="publicKey"
          loading={loading}
          showCard
          activeRowParams={{
            field: 'fraktBond.terminatedCounter',
            value: true,
            className: styles.termitated,
          }}
        />
        <div ref={fetchMoreTrigger} />
      </div>
      <Summary loans={loans} />
    </div>
  )
}
