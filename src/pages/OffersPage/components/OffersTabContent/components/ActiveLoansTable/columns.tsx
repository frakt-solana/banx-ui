import { ColumnType } from '@banx/components/Table'
import { HeaderCell, NftInfoCell, createSolValueJSX } from '@banx/components/TableComponents'

import { Loan, Offer } from '@banx/api/core'
import { OfferOptimistic } from '@banx/store'
import { formatDecimal } from '@banx/utils'

import { calculateLentValue } from '../OfferCard/helpers'
import { APRCell, ActionsCell, InterestCell, StatusCell } from './TableCells'

interface GetTableColumns {
  offers: Record<string, Offer[]>
  updateOrAddOffer: (offer: Offer[]) => void
  updateOrAddLoan: (loan: Loan) => void
  optimisticOffers: OfferOptimistic[]
}

export const getTableColumns = ({
  offers,
  updateOrAddOffer,
  updateOrAddLoan,
  optimisticOffers,
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
      render: (loan) => createSolValueJSX(calculateLentValue(loan), 1e9, '0◎', formatDecimal),
    },
    {
      key: 'repaid',
      title: <HeaderCell label="Repaid" />,
      render: (loan) => createSolValueJSX(loan.totalRepaidAmount, 1e9, '0◎', formatDecimal),
    },
    {
      key: 'interest',
      title: (
        <HeaderCell
          label="Claim"
          tooltipText="Current status and duration of the loan that has been passed"
        />
      ),
      render: (loan) => <InterestCell loan={loan} />,
    },
    {
      key: 'apy',
      title: <HeaderCell label="APY" />,
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
      render: (loan) => <StatusCell loan={loan} />,
    },
    {
      key: 'actionsCell',
      title: <HeaderCell label="" />,
      render: (loan) => (
        <ActionsCell
          offers={offers}
          updateOrAddOffer={updateOrAddOffer}
          updateOrAddLoan={updateOrAddLoan}
          optimisticOffers={optimisticOffers}
          loan={loan}
        />
      ),
    },
  ]

  return columns
}
