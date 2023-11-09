import { ColumnType } from '@banx/components/Table'
import { HeaderCell, NftInfoCell } from '@banx/components/TableComponents'

import { Loan, Offer } from '@banx/api/core'

import { APRCell, ActionsCell, InterestCell, LentCell, StatusCell } from './TableCells'

interface GetTableColumns {
  isCardView: boolean
  offers: Record<string, Offer[]>
  updateOrAddOffer: (offer: Offer) => void
  updateOrAddLoan: (loan: Loan) => void
}

export const getTableColumns = ({
  offers,
  updateOrAddOffer,
  updateOrAddLoan,
  isCardView,
}: GetTableColumns) => {
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
      render: (loan) => <LentCell loan={loan} />,
      sorter: true,
    },
    {
      key: 'interest',
      title: (
        <HeaderCell
          label="Total claim"
          tooltipText="Sum of lent amount and accrued interest to date"
        />
      ),
      render: (loan) => <InterestCell loan={loan} isCardView={isCardView} />,
    },
    {
      key: 'apy',
      title: <HeaderCell label="APY" />,
      render: (loan) => <APRCell loan={loan} />,
      sorter: true,
    },
    {
      key: 'status',
      title: (
        <HeaderCell
          label="Loan status"
          tooltipText="Current status and duration of the loan that has been passed"
        />
      ),
      render: (loan) => <StatusCell loan={loan} isCardView={isCardView} />,
      sorter: true,
    },
    {
      key: 'actionsCell',
      title: !isCardView ? <HeaderCell label="Termination" /> : undefined,
      render: (loan) => (
        <ActionsCell
          offers={offers}
          updateOrAddOffer={updateOrAddOffer}
          updateOrAddLoan={updateOrAddLoan}
          loan={loan}
          isCardView={isCardView}
        />
      ),
    },
  ]

  return columns
}
