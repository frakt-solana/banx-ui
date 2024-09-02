import { FC } from 'react'

import { BN } from 'fbonds-core'

import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { BorrowOffer, CollateralToken } from '@banx/api/tokens'
import { ZERO_BN } from '@banx/utils'

import { adjustAmountWithUpfrontFee } from '../helpers'

import styles from './OrderBook.module.less'

interface BorrowCellProps {
  offer: BorrowOffer
  selectedOffer: BorrowOffer | null
  collateral: CollateralToken | undefined
  restCollateralsAmount: BN
}

export const BorrowCell: FC<BorrowCellProps> = ({
  offer,
  selectedOffer,
  collateral,
  restCollateralsAmount,
}) => {
  const collateralDecimals = collateral?.collateral.decimals || 0
  const collateralMultiplier = Math.pow(10, collateralDecimals)

  const ltvPercent = parseFloat(offer.ltv) / 100

  const calculatedTokenToGet = BN.min(
    restCollateralsAmount.mul(new BN(collateralMultiplier)).div(new BN(offer.collateralsPerToken)),
    new BN(offer.maxTokenToGet),
  )

  const selectedOfferMaxTokenToGet = selectedOffer ? new BN(selectedOffer.maxTokenToGet) : ZERO_BN

  const borrowValueBN = !selectedOfferMaxTokenToGet.isZero()
    ? selectedOfferMaxTokenToGet
    : calculatedTokenToGet

  const adjustedBorrowValueToDisplay = adjustAmountWithUpfrontFee(borrowValueBN)

  return (
    <div className={styles.borrowValueContainer}>
      <DisplayValue value={adjustedBorrowValueToDisplay.toNumber()} />
      <span className={styles.ltvValue}>{createPercentValueJSX(ltvPercent)} LTV</span>
    </div>
  )
}

export const AprCell: FC<{ offer: BorrowOffer }> = ({ offer }) => {
  const aprRateWithProtocolFee = parseFloat(offer.apr)
  const aprPercent = aprRateWithProtocolFee / 100

  return (
    <div className={styles.aprRow}>
      <span className={styles.aprValue}>{createPercentValueJSX(aprPercent)}</span>
    </div>
  )
}
