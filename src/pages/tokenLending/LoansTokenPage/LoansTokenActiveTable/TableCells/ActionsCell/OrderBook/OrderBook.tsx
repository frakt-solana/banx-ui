import { FC, useCallback, useMemo } from 'react'

import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'

import Table from '@banx/components/Table'

import { core } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'

import { getTableColumns } from './columns'
import { useSelectedOffer } from './useSelectedOffers'

import styles from './OrderBook.module.less'

interface OrderBookProps {
  offers: BondOfferV3[]
  loan: core.TokenLoan
  isLoading: boolean
}

const OrderBook: FC<OrderBookProps> = ({ loan, offers, isLoading }) => {
  const { tokenType } = useNftTokenType()

  const { toggle: toggleOffer, find: findOfferInSelection } = useSelectedOffer()

  const onRowClick = useCallback(
    (offer: BondOfferV3) => {
      toggleOffer(offer)
    },
    [toggleOffer],
  )

  const columns = getTableColumns({
    findOfferInSelection,
    onRowClick,
    tokenType,
    loan,
  })

  const rowParams = useMemo(() => {
    return { onRowClick }
  }, [onRowClick])

  return (
    <div className={styles.container}>
      <Table
        data={offers}
        columns={columns}
        rowParams={rowParams}
        className={styles.table}
        classNameTableWrapper={styles.tableWrapper}
        loading={isLoading}
      />
    </div>
  )
}

export default OrderBook
