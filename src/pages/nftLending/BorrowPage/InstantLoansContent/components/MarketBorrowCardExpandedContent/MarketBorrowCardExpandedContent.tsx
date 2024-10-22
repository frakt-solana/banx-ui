import { FC, useMemo } from 'react'

import Table from '@banx/components/Table'

import { MarketPreview } from '@banx/api/nft'

import { Summary } from './components'
import { useBorrowTable } from './hooks'

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

  return (
    <div className={styles.tableRoot}>
      <Table
        data={tableNftsData}
        columns={columns}
        rowParams={rowParams}
        className={styles.borrowTable}
        loading={isLoading}
        showCard
      />
      <Summary
        nftsInCart={nftsInCart}
        loanValuePercent={loanValuePercent}
        maxNftsToBorrow={maxNftsToBorrow}
        onSelectNftsAmount={onSelectNftsAmount}
        setLoanValuePercent={setLoanValuePercent}
        marketPubkey={preview.marketPubkey}
      />
    </div>
  )
}
