import { ColumnType } from '@banx/components/Table'
import { HeaderCell, NftInfoCell, createSolValueJSX } from '@banx/components/TableComponents'

import { Loan, Offer } from '@banx/api/core'
import { formatDecimal } from '@banx/utils'

import { calculateLentValue } from '../OffersTabContent/components/OfferCard/helpers'
import { APRCell, ActionsCell, InterestCell, StatusCell } from './TableCells'
import { CLAIM_TOOLTIP_TEXT, STATUS_TOOLTIP_TEXT } from './constants'

interface GetTableColumns {
  offers: Record<string, Offer[]>
  updateOrAddOffer: (offer: Offer) => void
  updateOrAddLoan: (loan: Loan) => void
}

export const getTableColumns = ({ offers, updateOrAddOffer, updateOrAddLoan }: GetTableColumns) => {
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
      title: <HeaderCell label="Claim" tooltipText={CLAIM_TOOLTIP_TEXT} />,
      render: (loan) => <InterestCell loan={loan} />,
    },
    {
      key: 'apy',
      title: <HeaderCell label="APY" />,
      render: (loan) => <APRCell loan={loan} />,
    },
    {
      key: 'status',
      title: <HeaderCell label="Status" tooltipText={STATUS_TOOLTIP_TEXT} />,
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
          loan={loan}
        />
      ),
    },
  ]

  return columns
}
