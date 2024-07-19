import { BN } from 'fbonds-core'

import { Button } from '@banx/components/Buttons'
import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import {
  DisplayValue,
  HeaderCell,
  HorizontalCell,
  NftInfoCell,
  RarityCell,
} from '@banx/components/TableComponents'

import { coreNew } from '@banx/api/nft'
import { calculateBorrowValueWithProtocolFee } from '@banx/utils'

import styles from './RequestLoansTable.module.less'

interface GetTableColumnsProps {
  findNftInSelection: (mint: string) => coreNew.BorrowNft | null
  toggleNftInSelection: (nft: coreNew.BorrowNft) => void
  hasSelectedNfts: boolean
  onSelectAll: () => void
  requestedLoanValue: number
}

export const getTableColumns = ({
  onSelectAll,
  hasSelectedNfts,
  requestedLoanValue,
  toggleNftInSelection,
  findNftInSelection,
}: GetTableColumnsProps) => {
  const columns: ColumnType<coreNew.BorrowNft>[] = [
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
          selected={!!findNftInSelection(nft.mint.toBase58())}
          onCheckboxClick={() => toggleNftInSelection(nft)}
          nftName={nft.nft.meta.name}
          nftImage={nft.nft.meta.imageUrl}
          banxPoints={{
            partnerPoints: nft.nft.meta.partnerPoints || 0,
            playerPoints: nft.nft.meta.playerPoints || 0,
          }}
          hideCollectionName
        />
      ),
    },
    {
      key: 'rarity',
      title: <HeaderCell label="Rarity" />,
      render: ({ nft }) => <RarityCell rarity={nft.rarity} />,
    },
    {
      key: 'loanValue',
      title: <HeaderCell label="Borrow" />,
      render: () => (
        <HorizontalCell
          value={<DisplayValue value={requestedLoanValue} placeholder="--" />}
          className={styles.cellText}
        />
      ),
    },
    {
      key: 'fee',
      title: (
        <HeaderCell
          label="Upfront fee"
          tooltipText="1% upfront fee charged on the loan principal amount, paid when loan is funded"
        />
      ),
      render: () => {
        const upfrontFee =
          requestedLoanValue - calculateBorrowValueWithProtocolFee(new BN(requestedLoanValue))
        return (
          <HorizontalCell
            value={<DisplayValue value={upfrontFee} placeholder="--" />}
            className={styles.cellText}
          />
        )
      },
    },
    {
      key: 'borrowCell',
      title: <HeaderCell label="" />,
      render: (nft) => (
        <Button className={styles.selectButton} size="small">
          {findNftInSelection(nft.mint.toBase58()) ? 'Deselect' : 'Select'}
        </Button>
      ),
    },
  ]

  return columns
}
