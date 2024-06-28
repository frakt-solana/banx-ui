import { FC, useEffect, useMemo } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'
import Tooltip from '@banx/components/Tooltip'

import { Hourglass, Snowflake } from '@banx/icons'
import { ViewState, useTableView } from '@banx/store/common'
import { useTokenType } from '@banx/store/nft'
import { isBanxSolTokenType } from '@banx/utils'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useInstantLendTable } from './hooks'
import { useLoansState } from './loansState'

import styles from './InstantLendTable.module.less'

interface InstantLendTableProps {
  goToPlaceOfferTab: () => void
}

export const InstantLendTable: FC<InstantLendTableProps> = ({ goToPlaceOfferTab }) => {
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

  const rowParams = useMemo(() => {
    return {
      onRowClick: toggleLoanInSelection,
    }
  }, [toggleLoanInSelection])

  const emptyButtonText = isBanxSolTokenType(tokenType) ? 'Lend SOL' : 'Lend USDC'

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
        buttonProps={{ text: emptyButtonText, onClick: goToPlaceOfferTab }}
        className={styles.emptyList}
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
        emptyMessage={!loans.length ? 'No loans found' : undefined}
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
  <Tooltip title={loansAmount ? 'Expiring loans' : 'No expiring loans currently'}>
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
  <Tooltip title={loansAmount ? 'Loans with freeze' : 'No loans with freeze currently'}>
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
