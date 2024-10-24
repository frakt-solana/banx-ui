import { FC, useMemo } from 'react'

import Table from '@banx/components/Table'

import { MarketPreview } from '@banx/api/nft'

import { Summary } from './components'
import { TableNftData, useBorrowTable } from './hooks'

import styles from './MarketBorrowCardExpandedContent.module.less'

type MarketBorrowCardExpandedContentProps = {
  preview: MarketPreview
  goToRequestLoanTab: () => void
}

export const MarketBorrowCardExpandedContent: FC<MarketBorrowCardExpandedContentProps> = ({
  preview,
  goToRequestLoanTab,
}) => {
  const {
    isLoading,
    tableNftsData,
    columns,
    onNftSelect,
    nftsInCart,
    loanValuePercent,
    maxNftsToBorrow,
    onSelectNftsAmount,
    setLoanValuePercent,
  } = useBorrowTable({ marketPubkey: preview.marketPubkey, goToRequestLoanTab })

  const rowParams = useMemo(() => {
    return {
      onRowClick: onNftSelect,
    }
  }, [onNftSelect])

  const tableHeight = calculateTableHeight(tableNftsData)

  return (
    <>
      <div style={{ height: tableHeight }}>
        <Table
          data={tableNftsData}
          columns={columns}
          rowParams={rowParams}
          className={styles.borrowTable}
          classNameTableWrapper={styles.tableWrapper}
          loading={isLoading}
        />
      </div>

      <Summary
        nftsInCart={nftsInCart}
        loanValuePercent={loanValuePercent}
        maxNftsToBorrow={maxNftsToBorrow}
        onSelectNftsAmount={onSelectNftsAmount}
        setLoanValuePercent={setLoanValuePercent}
        marketPubkey={preview.marketPubkey}
      />
    </>
  )
}

const calculateTableHeight = (data: TableNftData[]) => {
  const HEADER_ROW_HEIGHT = 30
  const ROW_HEIGHT = 44
  const MAX_TABLE_HEIGHT = 260

  const tableHeight = HEADER_ROW_HEIGHT + data.length * ROW_HEIGHT
  return Math.min(tableHeight, MAX_TABLE_HEIGHT)
}
