import { FC, useEffect, useMemo } from 'react'

import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'
import Tooltip from '@banx/components/Tooltip'

import { Hourglass, Snowflake } from '@banx/icons'
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

  const {
    loans,
    sortViewParams,
    loading,
    showEmptyList,
    auctionLoansAmount,
    freezeLoansAmount,
    isAuctionFilterEnabled,
    toggleAuctionFilter,
    isFreezeFilterEnabled,
    toggleFreezeFilter,
  } = useInstantLendTable()

  const {
    selection,
    toggle: toggleLoanInSelection,
    find: findLoanInSelection,
    set: setSelection,
    clear: clearSelection,
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

  const goToLendPage = () => {
    navigate(createPathWithTokenParam(PATHS.LEND, tokenType))
  }

  const rowParams = useMemo(() => {
    return {
      onRowClick: toggleLoanInSelection,
    }
  }, [toggleLoanInSelection])

  const emptyButtonText = isSolTokenType(tokenType) ? 'Lend SOL' : 'Lend USDC'

  const customJSX = (
    <div className={styles.filterButtons}>
      <AuctionFilterButton
        loansAmount={auctionLoansAmount}
        isActive={isAuctionFilterEnabled}
        onClick={toggleAuctionFilter}
      />
      <FreezeFilterButton
        loansAmount={freezeLoansAmount}
        isActive={isFreezeFilterEnabled}
        onClick={toggleFreezeFilter}
      />
    </div>
  )

  if (showEmptyList)
    return (
      <EmptyList
        message="No offers to lend. Create an offer if you want to fund some loans"
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
        customJSX={customJSX}
        showCard
      />
      <Summary loans={loans} />
    </div>
  )
}

interface FilterButtonProps {
  onClick: () => void
  isActive: boolean
  loansAmount: number | null
}

const AuctionFilterButton: FC<FilterButtonProps> = ({ isActive, onClick, loansAmount }) => (
  <Tooltip title={loansAmount ? 'Auction loans' : 'No auction loans currently'}>
    <div
      className={classNames(styles.filterButtonWrapper, styles.auction)}
      data-loans-amount={loansAmount}
    >
      <Button
        className={classNames(
          styles.auctionFilterButton,
          { [styles.active]: isActive },
          { [styles.disabled]: !loansAmount },
        )}
        disabled={!loansAmount}
        onClick={onClick}
        variant="secondary"
        type="circle"
      >
        <Hourglass className={styles.hourglassIcon} />
      </Button>
    </div>
  </Tooltip>
)

const FreezeFilterButton: FC<FilterButtonProps> = ({ isActive, onClick, loansAmount }) => (
  <Tooltip title={loansAmount ? 'Freeze loans' : 'No freeze loans currently'}>
    <div
      className={classNames(styles.filterButtonWrapper, styles.freeze)}
      data-loans-amount={loansAmount}
    >
      <Button
        className={classNames(
          styles.freezeFilterButton,
          { [styles.active]: isActive },
          { [styles.disabled]: !loansAmount },
        )}
        disabled={!loansAmount}
        onClick={onClick}
        variant="secondary"
        type="circle"
      >
        <Snowflake className={styles.snowflakeIcon} />
      </Button>
    </div>
  </Tooltip>
)