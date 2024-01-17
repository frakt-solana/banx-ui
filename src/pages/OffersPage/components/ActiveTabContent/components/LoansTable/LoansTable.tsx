import { useCallback, useMemo } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'
import Tooltip from '@banx/components/Tooltip'

import { Loan } from '@banx/api/core'
import { Underwater } from '@banx/icons'
import { ViewState, useTableView } from '@banx/store'
import { isLoanLiquidated, isLoanTerminating, isUnderWaterLoan } from '@banx/utils'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useLoansTable } from './hooks'
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
    loansToClaim,
    underwaterLoans,
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
    return hasSelectedLoans ? clearSelection() : setSelection(underwaterLoans)
  }, [hasSelectedLoans, clearSelection, setSelection, underwaterLoans])

  const columns = getTableColumns({
    onSelectAll,
    findLoanInSelection,
    toggleLoanInSelection,
    hasSelectedLoans,
    isCardView: viewState === ViewState.CARD,
    isUnderwaterFilterActive,
  })

  const onRowClick = useCallback(
    (loan: Loan) => {
      if (isLoanTerminating(loan)) return

      toggleLoanInSelection(loan)
    },
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
    <Tooltip title={underwaterLoansCount ? 'Underwater loans' : 'No underwater loans currently'}>
      <div className={styles.filterButtonWrapper} data-underwater-loans={underwaterLoansCount}>
        <Button
          className={classNames(
            styles.filterButton,
            { [styles.active]: isUnderwaterFilterActive },
            { [styles.disabled]: !underwaterLoansCount },
          )}
          disabled={!underwaterLoansCount}
          onClick={onToggleUnderwaterFilter}
          type="circle"
          variant="secondary"
        >
          <Underwater />
        </Button>
      </div>
    </Tooltip>
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
        loansToClaim={loansToClaim}
        underwaterLoans={underwaterLoans}
        updateOrAddLoan={updateOrAddLoan}
        isUnderwaterFilterActive={isUnderwaterFilterActive}
        selectedLoans={selection}
        setSelection={setSelection}
        hideLoans={hideLoans}
      />
    </div>
  )
}
