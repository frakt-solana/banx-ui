import { FC } from 'react'

import { BN } from 'fbonds-core'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'

import Table from '@banx/components/Table'

import { core } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'

import { getTableColumns } from './columns'

import styles from './OrderBook.module.less'

interface OrderBookProps {
  offers: BondOfferV3[]
  loan: core.TokenLoan
  isLoading: boolean
  refinance: (offer: BondOfferV3, tokensToRefinance: BN) => void
}

const OrderBook: FC<OrderBookProps> = ({ loan, offers, isLoading, refinance }) => {
  const { tokenType } = useNftTokenType()

  const columns = getTableColumns({ refinance, tokenType, loan })

  return (
    <div className={styles.container}>
      <Table
        data={offers}
        columns={columns}
        className={styles.table}
        classNameTableWrapper={styles.tableWrapper}
        loading={isLoading}
      />
    </div>
  )
}

export default OrderBook
