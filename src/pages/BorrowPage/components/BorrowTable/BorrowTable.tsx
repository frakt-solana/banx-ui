import { FC } from 'react'

import Table from '@banx/components/TableVirtual'

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

  return (
    <div className={styles.tableRoot}>
      <Table
        data={tableNftData}
        columns={columns}
        onRowClick={onRowClick}
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
