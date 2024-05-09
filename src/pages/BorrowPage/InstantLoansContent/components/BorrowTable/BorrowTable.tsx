import { FC, useMemo } from 'react'

import Table from '@banx/components/Table'

import { BorrowNft, Offer } from '@banx/api/core'

import { Summary } from './Summary'
import { useBorrowTable } from './hooks'

import styles from './BorrowTable.module.less'

interface BorrowTableProps {
  nfts: BorrowNft[]
  isLoading: boolean
  rawOffers: Record<string, Offer[]>
  maxLoanValueByMarket: Record<string, number>
  goToRequestLoanTab: () => void
}

const BorrowTable: FC<BorrowTableProps> = ({
  nfts,
  isLoading,
  rawOffers,
  maxLoanValueByMarket,
  goToRequestLoanTab,
}) => {
  const {
    tableNftData,
    columns,
    onRowClick,
    sortViewParams,
    nftsInCart,
    selectAmount,
    borrowAll,
    maxBorrowAmount,
    maxBorrowPercent,
    setMaxBorrowPercent,
    bonkRewardsAvailable,
  } = useBorrowTable({
    nfts,
    rawOffers,
    maxLoanValueByMarket,
    goToRequestLoanTab,
  })

  const rowParams = useMemo(() => {
    return {
      onRowClick,
    }
  }, [onRowClick])

  return (
    <div className={styles.tableRoot}>
      <Table
        data={tableNftData}
        columns={columns}
        rowParams={rowParams}
        sortViewParams={sortViewParams}
        className={styles.borrowTable}
        loading={isLoading}
        showCard
      />
      <Summary
        nftsInCart={nftsInCart}
        borrowAll={borrowAll}
        selectAmount={selectAmount}
        maxBorrowAmount={maxBorrowAmount}
        maxBorrowPercent={maxBorrowPercent}
        setMaxBorrowPercent={setMaxBorrowPercent}
        bonkRewardsAvailable={bonkRewardsAvailable}
      />
    </div>
  )
}

export default BorrowTable
