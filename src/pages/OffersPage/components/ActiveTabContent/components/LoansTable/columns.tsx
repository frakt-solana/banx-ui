import { ColumnType } from '@banx/components/Table'
import { HeaderCell, NftInfoCell, createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calculateLentValue } from '@banx/pages/OffersPage'
import { formatDecimal } from '@banx/utils'

import { APRCell, ActionsCell, InterestCell, StatusCell } from './TableCells'

interface GetTableColumns {
  isCardView?: boolean
}

export const getTableColumns = ({ isCardView = false }: GetTableColumns) => {
  const columns: ColumnType<Loan>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" align="left" />,
      render: ({ nft }) => (
        <NftInfoCell
          nftName={nft.meta.name}
          nftImage={nft.meta.imageUrl}
          banxPoints={{
            partnerPoints: nft.meta.partnerPoints || 0,
            playerPoints: nft.meta.playerPoints || 0,
          }}
        />
      ),
    },
    {
      key: 'lent',
      title: <HeaderCell label="Lent" />,
      render: (loan) => createSolValueJSX(calculateLentValue(loan), 1e9, '0◎', formatDecimal),
    },
    {
      key: 'repaid',
      title: (
        <HeaderCell
          label="Repaid"
          tooltipText="Repayments returned to pending offer if open, or wallet if closed"
        />
      ),
      render: (loan) => createSolValueJSX(loan.totalRepaidAmount, 1e9, '0◎', formatDecimal),
    },
    {
      key: 'interest',
      title: (
        <HeaderCell
          label="Claim"
          tooltipText="Sum of lent amount and accrued interest to date, less any repayments"
        />
      ),
      render: (loan) => <InterestCell loan={loan} isCardView={isCardView} />,
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (loan) => <APRCell loan={loan} />,
    },
    {
      key: 'status',
      title: (
        <HeaderCell
          label="Status"
          tooltipText="Current status and duration of the loan that has been passed"
        />
      ),
      render: (loan) => <StatusCell loan={loan} isCardView={isCardView} />,
    },
    {
      key: 'actionsCell',
      title: !isCardView ? <HeaderCell label="" /> : undefined,
      render: (loan) => <ActionsCell loan={loan} isCardView={isCardView} />,
    },
  ]

  return columns
}
