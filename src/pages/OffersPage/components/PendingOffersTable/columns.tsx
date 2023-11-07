import { ColumnType } from '@banx/components/Table'
import { HeaderCell, NftInfoCell, createSolValueJSX } from '@banx/components/TableComponents'

import { formatDecimal, formatLoansAmount } from '@banx/utils'

import { APRCell, ActionsCell, InterestCell, OfferCell } from './TableCells'
import { TableUserOfferData } from './helpers'

export const getTableColumns = ({ isCardView }: { isCardView: boolean }) => {
  const columns: ColumnType<TableUserOfferData>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collection" align="left" />,
      render: ({ collectionImage, collectionName }) => (
        <NftInfoCell nftName={collectionName} nftImage={collectionImage} />
      ),
    },
    {
      key: 'offer',
      title: <HeaderCell label="Offer" />,
      render: (offer) => <OfferCell offer={offer} isCardView={isCardView} />,
    },
    {
      key: 'loans',
      title: <HeaderCell label="Loans" />,
      render: ({ loansAmount }) => <>{formatLoansAmount(loansAmount)}</>,
    },
    {
      key: 'size',
      title: <HeaderCell label="Size" />,
      render: ({ size }) => createSolValueJSX(size, 1e9, '--', formatDecimal),
    },
    {
      key: 'interest',
      title: <HeaderCell label="Est. Weekly interest" />,
      render: (offer) => <InterestCell offer={offer} />,
    },
    {
      key: 'apy',
      title: <HeaderCell label="APY" />,
      render: (offer) => <APRCell offer={offer} />,
    },
    {
      key: 'actionsCell',
      title: <HeaderCell label="" />,
      render: (offer) => <ActionsCell isCardView={isCardView} offer={offer} />,
    },
  ]

  return columns
}
