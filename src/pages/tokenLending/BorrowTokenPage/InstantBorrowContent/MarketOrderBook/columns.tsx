import { FC } from 'react'

import { BondOfferV3, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import Checkbox from '@banx/components/Checkbox'
import { calculateLtvPercent } from '@banx/components/PlaceTokenOfferSection'
import { ColumnType } from '@banx/components/Table'
import { DisplayValue, HeaderCell, createPercentValueJSX } from '@banx/components/TableComponents'

import { convertBondOfferV3ToCore } from '@banx/api/nft'
import { CollateralToken } from '@banx/api/tokens'
import {
  adjustAmountWithUpfrontFee,
  calculateIdleFundsInOffer,
  calculateTokensPerCollateral,
  formatTokensPerCollateralToStr,
  getTokenDecimals,
} from '@banx/utils'

import styles from './MarketOrderBook.module.less'

type GetTableColumns = (props: {
  collateral: CollateralToken
  tokenType: LendingTokenType
}) => ColumnType<BondOfferV3>[]

export const getTableColumns: GetTableColumns = ({ collateral, tokenType }) => {
  const columns: ColumnType<BondOfferV3>[] = [
    {
      key: 'borrow',
      title: (
        <div className={styles.checkboxRow}>
          <Checkbox className={styles.checkbox} onChange={() => null} checked={false} />
          <HeaderCell label="To borrow" />
        </div>
      ),
      render: (offer) => {
        return (
          <div className={styles.checkboxRow}>
            <Checkbox className={styles.checkbox} onChange={() => null} checked={false} />
            <BorrowCell offer={offer} collateral={collateral} tokenType={tokenType} />
          </div>
        )
      },
    },
    {
      key: 'apr',
      title: (
        <div className={styles.aprRow}>
          <HeaderCell label="APR" />
        </div>
      ),
      render: (offer) => <AprCell offer={offer} />,
    },
    {
      key: 'offerSize',
      title: <HeaderCell label="Offer size" />,
      render: (offer) => (
        <span className={styles.offerSizeValue}>
          <DisplayValue
            value={calculateIdleFundsInOffer(convertBondOfferV3ToCore(offer)).toNumber()}
          />
        </span>
      ),
    },
  ]

  return columns
}

const AprCell: FC<{ offer: BondOfferV3 }> = ({ offer }) => {
  const aprRateWithProtocolFee = offer.loanApr.toNumber()
  const aprPercent = aprRateWithProtocolFee / 100

  return (
    <div className={styles.aprRow}>
      <span className={styles.aprValue}>{createPercentValueJSX(aprPercent)}</span>
    </div>
  )
}

interface BorrowCellProps {
  offer: BondOfferV3
  collateral: CollateralToken
  tokenType: LendingTokenType
}

export const BorrowCell: FC<BorrowCellProps> = ({ offer, collateral, tokenType }) => {
  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType)) //? 1e9 => 9, 1e6 => 6

  const offerSize = calculateIdleFundsInOffer(convertBondOfferV3ToCore(offer))
  const adjustedBorrowValueToDisplay = adjustAmountWithUpfrontFee(offerSize)

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

  return (
    <div className={styles.borrowCell}>
      <DisplayValue value={adjustedBorrowValueToDisplay.toNumber()} />
      <span className={styles.ltvValue}>{createPercentValueJSX(ltvPercent)} LTV</span>
    </div>
  )
}
