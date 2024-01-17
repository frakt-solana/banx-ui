import { useCallback, useMemo } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { Loan } from '@banx/api/core'
import { Underwater } from '@banx/icons'
import { ViewState, useTableView } from '@banx/store'
import { isLoanLiquidated, isLoanTerminating, isUnderWaterLoan } from '@banx/utils'

import { Summary } from './Summary/Summary'
import { getTableColumns } from './columns'
import { useLoansTable } from './hooks/useLoansTable'
import { useSelectedLoans } from './loansState'

import styles from './LoansTable.module.less'

export const LoansTable = () => {
  const {
    loans,
    sortViewParams,
    hideLoans,
    updateOrAddLoan,
    loading,
    showEmptyList,
    emptyMessage,
    isUnderwaterFilterActive,
    onToggleUnderwaterFilter,
    underwaterLoansCount,
  } = useLoansTable()

  const { viewState } = useTableView()

  const {
    selection,
    toggle: toggleLoanInSelection,
    find: findLoanInSelection,
    clear: clearSelection,
    set: setSelection,
  } = useSelectedLoans()

  const hasSelectedLoans = !!selection?.length

  const onSelectAll = useCallback(() => {
    if (hasSelectedLoans) {
      clearSelection()
    } else {
      setSelection(loans)
    }
  }, [clearSelection, loans, hasSelectedLoans, setSelection])

  const columns = getTableColumns({
    onSelectAll,
    findLoanInSelection,
    toggleLoanInSelection,
    hasSelectedLoans,
    isCardView: viewState === ViewState.CARD,
    isUnderwaterFilterActive,
  })

  const onRowClick = useCallback(
    (loan: Loan) => toggleLoanInSelection(loan),
    [toggleLoanInSelection],
  )

  const rowParams = useMemo(() => {
    return {
      onRowClick,
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
        {
          condition: (loan: Loan) => isUnderWaterLoan(loan),
          className: styles.underwater,
          cardClassName: styles.underwater,
        },
      ],
    }
  }, [onRowClick])

  const customFiltersJSX = (
    <div className={styles.filterButtonWrapper} data-underwater-loans={underwaterLoansCount}>
      <Button
        className={classNames(styles.filterButton, { [styles.active]: isUnderwaterFilterActive })}
        onClick={onToggleUnderwaterFilter}
        type="circle"
        variant="secondary"
      >
        <Underwater />
      </Button>
    </div>
  )

  if (showEmptyList) return <EmptyList message={emptyMessage} />

  return (
    <div className={styles.tableRoot}>
      <Table
        data={loans}
        columns={columns}
        rowParams={rowParams}
        sortViewParams={sortViewParams}
        loading={loading}
        customFiltersJSX={customFiltersJSX}
        showCard
      />
      <Summary
        loans={loans}
        updateOrAddLoan={updateOrAddLoan}
        isUnderwaterFilterActive={isUnderwaterFilterActive}
        selectedLoans={selection}
        setSelection={setSelection}
        hideLoans={hideLoans}
      />
    </div>
  )
}
