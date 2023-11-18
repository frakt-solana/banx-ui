import { ColumnType } from '@banx/components/Table'
import { HeaderCell, NftInfoCell, createSolValueJSX } from '@banx/components/TableComponents'
import Timer from '@banx/components/Timer/Timer'

import { Loan } from '@banx/api/core'
import { formatDecimal } from '@banx/utils'

import {
  APRCell,
  /* APRIncreaseCell */
  DebtCell,
  LTVCell,
  RefinanceCell,
} from './TableCells'
import { SECONDS_IN_72_HOURS } from './constants'
import { calcWeeklyInterestFee } from './helpers'

interface GetTableColumnsProps {
  onSelectLoan: (loan: Loan) => void
  findSelectedLoan: (loanPubkey: string) => Loan | undefined
  isCardView: boolean
}

export const getTableColumns = ({
  isCardView,
  onSelectLoan,
  findSelectedLoan,
}: GetTableColumnsProps) => {
  const columns: ColumnType<Loan>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" align="left" />,
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
      render: (loan) => createSolValueJSX(loan.nft.collectionFloor, 1e9, '--', formatDecimal),
      sorter: true,
    },
    {
      key: 'repayValue',
      title: <HeaderCell label="Debt" />,
      render: (loan) => <DebtCell loan={loan} />,
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
      render: (loan) => createSolValueJSX(calcWeeklyInterestFee(loan), 1e9, '--', formatDecimal),
    },
    {
      key: 'apy',
      title: <HeaderCell label="APY" />,
      render: (loan) => <APRCell loan={loan} />,
      sorter: true,
    },
    // {
    //   key: 'nextAprIncrease',
    //   title: <HeaderCell label="Next APY increase" />,
    //   render: (loan) => <APRIncreaseCell loan={loan} />,
    // },
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
