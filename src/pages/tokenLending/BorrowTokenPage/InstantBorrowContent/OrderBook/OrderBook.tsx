import { FC } from 'react'

import Table from '@banx/components/Table'

import { useTokenMarketOffers } from '@banx/pages/tokenLending/LendTokenPage'

import { getTableColumns } from './columns'

import styles from './OrderBook.module.less'

interface OrderBookProps {
  marketPubkey: string
}

const OrderBook: FC<OrderBookProps> = ({ marketPubkey }) => {
  const { offers, isLoading } = useTokenMarketOffers(marketPubkey)

  const columns = getTableColumns()

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
