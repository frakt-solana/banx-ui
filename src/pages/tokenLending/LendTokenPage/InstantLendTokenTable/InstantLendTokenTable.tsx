import { FC, useEffect, useMemo } from 'react'

import Table from '@banx/components/Table'

import { ViewState, useTableView } from '@banx/store/common'
import { useTokenType } from '@banx/store/token'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useInstantLendTokenTable } from './hooks'
import { useLoansState } from './loansState'

import styles from './InstantLendTokenTable.module.less'

interface InstantLendTableProps {
  goToPlaceOfferTab: () => void
}

const InstantLendTokenTable: FC<InstantLendTableProps> = () => {
  const { tokenType } = useTokenType()
  const { viewState } = useTableView()

  const { loans, isLoading } = useInstantLendTokenTable()

  const {
    selection,
    toggle: toggleLoanInSelection,
    find: findLoanInSelection,
    clear: clearSelection,
    set: setSelection,
  } = useLoansState()

  //? Clear selection when tokenType changes
  //? To prevent selection transfering from one tokenType to another
  useEffect(() => {
    clearSelection()
  }, [clearSelection, tokenType])

  const hasSelectedLoans = !!selection.length

  const onSelectAll = () => {
    if (hasSelectedLoans) {
      clearSelection()
    } else {
      setSelection(loans)
    }
  }

  const columns = getTableColumns({
    isCardView: viewState === ViewState.CARD,
    toggleLoanInSelection,
    findLoanInSelection,
    onSelectAll,
    hasSelectedLoans,
  })

  const rowParams = useMemo(() => {
    return {
      onRowClick: toggleLoanInSelection,
    }
  }, [toggleLoanInSelection])

  return (
    <div className={styles.tableRoot}>
      <Table
        data={loans}
        columns={columns}
        rowParams={rowParams}
        loading={isLoading}
        className={styles.table}
        emptyMessage={!loans.length ? 'No loans found' : undefined}
        showCard
      />
      <Summary loans={loans} />
    </div>
  )
}

export default InstantLendTokenTable
