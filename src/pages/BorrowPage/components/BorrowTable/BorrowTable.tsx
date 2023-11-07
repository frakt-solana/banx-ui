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
}

const BorrowTable: FC<BorrowTableProps> = ({ nfts, isLoading, rawOffers }) => {
  const { tableNftData, columns, onRowClick, sortViewParams, nftsInCart, selectAll, borrowAll } =
    useBorrowTable({
      nfts,
      rawOffers,
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
      <Summary nftsInCart={nftsInCart} selectAll={selectAll} borrowAll={borrowAll} />
    </div>
  )
}

export default BorrowTable
