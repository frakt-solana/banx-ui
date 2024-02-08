import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import {
  HeaderCell,
  HorizontalCell,
  NftInfoCell,
  createPercentValueJSX,
  createSolValueJSX,
} from '@banx/components/TableComponents'
import Timer from '@banx/components/Timer/Timer'

import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue, formatDecimal } from '@banx/utils'

import { LTVCell, RefinanceCell } from './TableCells'
import { SECONDS_IN_72_HOURS } from './constants'
import { calcWeeklyInterestFee } from './helpers'

import styles from './RefinanceTable.module.less'

interface GetTableColumnsProps {
  onSelectLoan: (loan: Loan) => void
  findSelectedLoan: (loanPubkey: string) => Loan | undefined
  onSelectAll: () => void
  isCardView: boolean
  hasSelectedLoans: boolean
}

export const getTableColumns = ({
  isCardView,
  onSelectLoan,
  findSelectedLoan,
  onSelectAll,
  hasSelectedLoans,
}: GetTableColumnsProps) => {
  const columns: ColumnType<Loan>[] = [
    {
      key: 'collateral',
      title: (
        <div className={styles.headerTitleRow}>
          <Checkbox className={styles.checkbox} onChange={onSelectAll} checked={hasSelectedLoans} />
          <HeaderCell label="Collateral" />
        </div>
      ),
      render: (loan) => (
        <NftInfoCell
          selected={!!findSelectedLoan(loan.publicKey)}
          onCheckboxClick={() => onSelectLoan(loan)}
          nftName={loan.nft.meta.name}
          nftImage={loan.nft.meta.imageUrl}
          banxPoints={{
            partnerPoints: loan.nft.meta.partnerPoints || 0,
            playerPoints: loan.nft.meta.playerPoints || 0,
          }}
        />
      ),
    },
    {
      key: 'floorPrice',
      title: <HeaderCell label="Floor" />,
      render: (loan) => (
        <HorizontalCell
          value={createSolValueJSX(loan.nft.collectionFloor, 1e9, '--', formatDecimal)}
        />
      ),
      sorter: true,
    },
    {
      key: 'repayValue',
      title: <HeaderCell label="Debt" />,
      render: (loan) => {
        const repayValue = calculateLoanRepayValue(loan)
        return <HorizontalCell value={createSolValueJSX(repayValue, 1e9, '--', formatDecimal)} />
      },
      sorter: true,
    },
    {
      key: 'ltv',
      title: <HeaderCell label="LTV" />,
      render: (loan) => <LTVCell loan={loan} />,
      sorter: true,
    },
    {
      key: 'interest',
      title: <HeaderCell label="Weekly interest" />,
      render: (loan) => (
        <HorizontalCell
          value={createSolValueJSX(calcWeeklyInterestFee(loan), 1e9, '--', formatDecimal)}
        />
      ),
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (loan) => (
        <HorizontalCell
          value={createPercentValueJSX(loan.bondTradeTransaction.amountOfBonds / 100)}
          isHighlighted
        />
      ),
      sorter: true,
    },

    {
      key: 'duration',
      title: <HeaderCell label="Ends in" />,
      render: ({ fraktBond }) => (
        <Timer expiredAt={fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS} />
      ),
      sorter: true,
    },
    {
      key: 'refinanceCell',
      title: <HeaderCell label="" />,
      render: (loan) => (
        <RefinanceCell
          loan={loan}
          isCardView={isCardView}
          disabledAction={!!findSelectedLoan(loan.publicKey)}
        />
      ),
    },
  ]

  return columns
}
