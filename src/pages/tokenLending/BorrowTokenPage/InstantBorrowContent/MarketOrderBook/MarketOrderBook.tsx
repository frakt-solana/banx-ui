import { FC, useMemo } from 'react'

import { sortBy } from 'lodash'

import Table from '@banx/components/Table'

import { CollateralToken } from '@banx/api/tokens'
import { useTokenMarketOffers } from '@banx/pages/tokenLending/LendTokenPage'
import { useNftTokenType } from '@banx/store/nft'

import { getTableColumns } from './columns'

import styles from './MarketOrderBook.module.less'

interface MarketOrderBookProps {
  collateral: CollateralToken
}

const MarketOrderBook: FC<MarketOrderBookProps> = ({ collateral }) => {
  const { offers, isLoading } = useTokenMarketOffers(collateral.marketPubkey)

  const { tokenType } = useNftTokenType()
  const columns = getTableColumns({ collateral, tokenType })

  const sortedOffers = useMemo(() => {
    return sortBy(offers, (offer) => offer.validation.collateralsPerToken.toNumber())
  }, [offers])

  return (
    <Table
      data={sortedOffers}
      columns={columns}
      className={styles.table}
      classNameTableWrapper={styles.tableWrapper}
      emptyMessage={!offers.length ? 'Not found suitable offers' : ''}
      loaderClassName={styles.tableLoader}
      loading={isLoading}
    />
  )
}

export default MarketOrderBook
