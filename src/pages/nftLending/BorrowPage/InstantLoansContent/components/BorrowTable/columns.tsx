import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import {
  DisplayValue,
  HeaderCell,
  HorizontalCell,
  NftInfoCell,
} from '@banx/components/TableComponents'

import { calculateBorrowValueWithProtocolFee } from '@banx/utils'

import { CartState } from '../../cartState'
import { BorrowActionCell } from './BorrowActionCell'
import { APRCell, BorrowCell } from './cells'
import { TableNftData } from './types'

import styles from './BorrowTable.module.less'

interface GetTableColumnsProps {
  onNftSelect: (nft: TableNftData) => void
  onBorrow: (nft: TableNftData) => Promise<void>
  findOfferInCart: CartState['findOfferInCart']
  isCardView: boolean
  hasSelectedNfts: boolean
  onSelectAll: () => void
  tokenType: LendingTokenType
  goToRequestLoanTab: () => void
}

export const getTableColumns = ({
  findOfferInCart,
  onNftSelect,
  onBorrow,
  isCardView,
  hasSelectedNfts,
  onSelectAll,
  tokenType,
  goToRequestLoanTab,
}: GetTableColumnsProps) => {
  const columns: ColumnType<TableNftData>[] = [
    {
      key: 'collateral',
      title: (
        <div className={styles.headerTitleRow}>
          <Checkbox className={styles.checkbox} onChange={onSelectAll} checked={hasSelectedNfts} />
          <HeaderCell label="Collateral" />
        </div>
      ),
      render: (nft) => (
        <NftInfoCell
          key={nft.mint.toBase58()}
          selected={nft.selected}
          onCheckboxClick={() => onNftSelect(nft)}
          nftName={nft.nft.nft.meta.name}
          nftImage={nft.nft.nft.meta.imageUrl}
          banxPoints={{
            partnerPoints: nft.nft.nft.meta.partnerPoints || 0,
            playerPoints: nft.nft.nft.meta.playerPoints || 0,
          }}
        />
      ),
    },
    {
      key: 'loanValue',
      title: <HeaderCell label="Borrow" />,
      render: (nft) => <BorrowCell nft={nft} tokenType={tokenType} />,
    },
    {
      key: 'fee',
      title: (
        <HeaderCell
          label="Upfront fee"
          tooltipText="1% upfront fee charged on the principal amount"
        />
      ),
      render: ({ loanValue }) => {
        const upfrontFee = loanValue.toNumber() - calculateBorrowValueWithProtocolFee(loanValue)
        return <HorizontalCell value={<DisplayValue value={upfrontFee} placeholder="--" />} />
      },
    },
    {
      key: 'apr',
      title: (
        <HeaderCell
          label="Apr"
          tooltipText="Annual interest rate. Dynamic when selecting Max LTV to borrow, fixed once loan is active"
        />
      ),
      render: (nft) => <APRCell nft={nft} />,
    },
    {
      key: 'borrowCell',
      title: <HeaderCell label="" />,
      render: (nft) => (
        <BorrowActionCell
          isCardView={isCardView}
          loanValue={nft.loanValue.toNumber()}
          disabled={!!findOfferInCart({ mint: nft.mint.toBase58() })}
          onBorrow={async () => await onBorrow(nft)}
          goToRequestLoanTab={goToRequestLoanTab}
        />
      ),
    },
  ]

  return columns
}
