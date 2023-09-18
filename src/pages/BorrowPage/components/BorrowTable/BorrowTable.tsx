import { FC } from 'react'

import Table from '@banx/components/Table'

import { BorrowNft, Offer } from '@banx/api/core'
import { useFakeInfinityScroll } from '@banx/hooks'

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

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: tableNftData })

  return (
    <div className={styles.tableRoot}>
      <Table
        data={data}
        columns={columns}
        onRowClick={onRowClick}
        sortViewParams={sortViewParams}
        className={styles.borrowTable}
        rowKeyField="mint"
        loading={isLoading}
        showCard
      />
      <div ref={fetchMoreTrigger} />
      <Summary nftsInCart={nftsInCart} selectAll={selectAll} borrowAll={borrowAll} />
    </div>
  )
}

export default BorrowTable
