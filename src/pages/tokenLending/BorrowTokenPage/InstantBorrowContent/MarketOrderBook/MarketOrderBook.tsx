import { FC, useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { getBondingCurveTypeFromLendingToken } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { chain } from 'lodash'

import Table from '@banx/components/Table'

import { BorrowOffer, CollateralToken, core } from '@banx/api/tokens'
import { useTokenType } from '@banx/store/common'

import { getTableColumns } from './columns'

import styles from './MarketOrderBook.module.less'

interface MarketOrderBookProps {
  collateral: CollateralToken
}

const MAX_LTV_THRESHOLD = 10000 //? Base points

const MarketOrderBook: FC<MarketOrderBookProps> = ({ collateral }) => {
  const { data: offers, isLoading } = useQuery(
    ['borrowOffersMarketOrderBook', collateral],
    () =>
      core.fetchBorrowOffers({
        market: collateral.marketPubkey,
        bondingCurveType: getBondingCurveTypeFromLendingToken(tokenType),
        customLtv: undefined,
      }),
    {
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
    },
  )

  const { tokenType } = useTokenType()
  const columns = getTableColumns({ collateral, tokenType })

  const filteredOffers: BorrowOffer[] = useMemo(() => {
    return chain(offers)
      .filter(({ ltv }) => parseInt(ltv) <= MAX_LTV_THRESHOLD)
      .sortBy(({ collateralsPerToken }) => parseInt(collateralsPerToken))
      .value()
  }, [offers])

  return (
    <Table
      data={filteredOffers}
      columns={columns}
      className={styles.table}
      classNameTableWrapper={classNames(styles.tableWrapper, {
        [styles.showOverlay]: !!filteredOffers.length,
      })}
      emptyMessage={!filteredOffers.length ? 'No suitable offers' : ''}
      loaderClassName={styles.tableLoader}
      loading={isLoading}
    />
  )
}

export default MarketOrderBook
