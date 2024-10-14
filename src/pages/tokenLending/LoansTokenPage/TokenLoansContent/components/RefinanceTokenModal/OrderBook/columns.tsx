import { BN } from 'fbonds-core'
import { BondOfferV3, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { ColumnType } from '@banx/components/Table'
import { HeaderCell } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'

import { ActionCell, AprCell, BorrowCell, DebtCell } from './cells'

type GetTableColumns = (props: {
  refinance: (offer: BondOfferV3, tokensToRefinance: BN) => void
  loan: core.TokenLoan
  tokenType: LendingTokenType
}) => ColumnType<BondOfferV3>[]

export const getTableColumns: GetTableColumns = ({ refinance, loan, tokenType }) => {
  const columns: ColumnType<BondOfferV3>[] = [
    {
      key: 'borrow',
      title: <HeaderCell label="Borrowed" align="left" />,
      render: (offer) => <BorrowCell loan={loan} offer={offer} tokenType={tokenType} />,
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (offer) => <AprCell offer={offer} />,
    },
    {
      key: 'debt',
      title: <HeaderCell label="Debt" />,
      render: (offer) => <DebtCell loan={loan} offer={offer} tokenType={tokenType} />,
    },
    {
      key: 'action',
      render: (offer) => (
        <ActionCell loan={loan} offer={offer} tokenType={tokenType} refinance={refinance} />
      ),
    },
  ]

  return columns
}
