import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { chain } from 'lodash'

import { calculateLtvPercent } from '@banx/components/PlaceTokenOfferSection'
import Table from '@banx/components/Table'

import { CollateralToken } from '@banx/api/tokens'
import { useTokenMarketOffers } from '@banx/pages/tokenLending/LendTokenPage'
import { useNftTokenType } from '@banx/store/nft'
import {
  calculateTokensPerCollateral,
  formatTokensPerCollateralToStr,
  getTokenDecimals,
} from '@banx/utils'

import { getTableColumns } from './columns'

import styles from './MarketOrderBook.module.less'

interface MarketOrderBookProps {
  collateral: CollateralToken
}

const MAX_LTV_THRESHOLD = 100

const MarketOrderBook: FC<MarketOrderBookProps> = ({ collateral }) => {
  const { publicKey } = useWallet()
  const { offers, isLoading } = useTokenMarketOffers(collateral.marketPubkey)

  const { tokenType } = useNftTokenType()
  const columns = getTableColumns({ collateral, tokenType })

  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType)) //? 1e9 => 9, 1e6 => 6

  const filteredOffers = useMemo(() => {
    return chain(offers)
      .filter((offer) => offer.assetReceiver.toBase58() !== publicKey?.toBase58())
      .filter((offer) => {
        const tokensPerCollateral = formatTokensPerCollateralToStr(
          calculateTokensPerCollateral(
            offer.validation.collateralsPerToken,
            collateral.collateral.decimals,
          ),
        )

        const ltvPercent = calculateLtvPercent({
          collateralPerToken: tokensPerCollateral,
          collateralPrice: collateral.collateralPrice,
          marketTokenDecimals,
        })

        return ltvPercent <= MAX_LTV_THRESHOLD
      })
      .sortBy((offer) => offer.validation.collateralsPerToken.toNumber())
      .value()
  }, [collateral, marketTokenDecimals, offers, publicKey])

  return (
    <Table
      data={filteredOffers}
      columns={columns}
      className={styles.table}
      classNameTableWrapper={classNames(styles.tableWrapper, {
        [styles.showOverlay]: !!offers.length,
      })}
      emptyMessage={!filteredOffers.length ? 'No suitable offers' : ''}
      loaderClassName={styles.tableLoader}
      loading={isLoading}
    />
  )
}

export default MarketOrderBook
