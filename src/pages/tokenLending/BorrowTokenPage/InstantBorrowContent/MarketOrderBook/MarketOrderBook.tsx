import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { chain } from 'lodash'

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
  const { publicKey } = useWallet()
  const { offers, isLoading } = useTokenMarketOffers(collateral.marketPubkey)

  const { tokenType } = useNftTokenType()
  const columns = getTableColumns({ collateral, tokenType })

  const filteredOffers = useMemo(() => {
    return chain(offers)
      .filter((offer) => offer.assetReceiver.toBase58() !== publicKey?.toBase58())
      .sortBy((offer) => offer.validation.collateralsPerToken.toNumber())
      .value()
  }, [offers, publicKey])

  return (
    <Table
      data={filteredOffers}
      columns={columns}
      className={styles.table}
      classNameTableWrapper={classNames(styles.tableWrapper, {
        [styles.showOverlay]: !!offers.length,
      })}
      emptyMessage={!filteredOffers.length ? 'Not found suitable offers' : ''}
      loaderClassName={styles.tableLoader}
      loading={isLoading}
    />
  )
}

export default MarketOrderBook
