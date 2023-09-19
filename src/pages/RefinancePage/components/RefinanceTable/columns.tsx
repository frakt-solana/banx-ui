import { ColumnType } from 'antd/es/table'

import {
  HeaderCell,
  NftInfoCell,
  createColumn,
  createSolValueJSX,
} from '@banx/components/TableComponents'
import Timer from '@banx/components/Timer/Timer'

import { Loan } from '@banx/api/core'

import { APRCell, APRIncreaseCell, DebtCell, RefinanceCell } from './TableCells'
import { INCREASE_PERCENT_APR_PER_HOUR, SECONDS_IN_72_HOURS } from './constants'

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
      title: <HeaderCell label="Collateral" />,
      render: (_, loan) => (
        <NftInfoCell
          selected={!!findSelectedLoan(loan.publicKey)}
          onCheckboxClick={() => onSelectLoan(loan)}
          nftName={loan.nft.meta.name}
          nftImage={loan.nft.meta.imageUrl}
        />
      ),
    },
    {
      key: 'floorPrice',
      title: <HeaderCell label="Floor" />,
      render: (_, loan) => createSolValueJSX(loan.nft.collectionFloor, 1e9),
    },
    {
      key: 'repayValue',
      title: <HeaderCell label="Debt" />,
      render: (_, loan) => <DebtCell loan={loan} />,
    },
    {
      key: 'apy',
      title: <HeaderCell label="APY" />,
      render: (_, loan) => <APRCell loan={loan} />,
    },
    {
      key: 'aprIncrease',
      title: <HeaderCell label="APR increase" />,
      render: () => <span>+{INCREASE_PERCENT_APR_PER_HOUR} %</span>,
    },
    {
      key: 'nextAprIncrease',
      title: <HeaderCell label="Next APR increase" />,
      render: (_, loan) => <APRIncreaseCell loan={loan} />,
    },
    {
      key: 'duration',
      title: <HeaderCell label="Ends in" />,
      render: (_, { fraktBond }) => (
        <Timer expiredAt={fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS} />
      ),
      sorter: true,
    },
    {
      title: <HeaderCell label="" />,
      render: (_, loan) => <RefinanceCell loan={loan} isCardView={isCardView} />,
    },
  ]

  return columns.map((column) => createColumn(column))
}
