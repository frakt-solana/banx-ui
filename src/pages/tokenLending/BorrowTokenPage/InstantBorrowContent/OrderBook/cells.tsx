import { FC } from 'react'

import { BN } from 'fbonds-core'

import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { BorrowOffer, CollateralToken } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'

import { adjustAmountWithUpfrontFee } from '../helpers'
import { BorrowOfferOptimistic } from '../hooks/useSelectedOffers'

import styles from './OrderBook.module.less'

interface BorrowCellProps {
  offer: BorrowOffer
  selectedOffer: BorrowOfferOptimistic | null
  collateral: CollateralToken | undefined
  restCollateralsAmount: number
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

  const maxTokenToGet = parseFloat(offer.maxTokenToGet)
  const collateralPerToken = parseFloat(offer.collateralsPerToken)

  const calculatedTokenToGet = Math.min(
    (restCollateralsAmount * collateralMultiplier) / collateralPerToken,
    maxTokenToGet,
  )

  const selectedOfferMaxTokenToGet = selectedOffer
    ? parseFloat(selectedOffer.offer.maxTokenToGet)
    : 0

  const borrowValueToDisplay = selectedOfferMaxTokenToGet || calculatedTokenToGet

  const adjustedBorrowValueToDisplay = adjustAmountWithUpfrontFee(
    new BN(borrowValueToDisplay),
  ).toNumber()

  return (
    <div className={styles.borrowValueContainer}>
      <DisplayValue value={adjustedBorrowValueToDisplay} />
      <span className={styles.ltvValue}>{createPercentValueJSX(ltvPercent)} LTV</span>
    </div>
  )
}

export const AprCell: FC<{ offer: BorrowOffer }> = ({ offer }) => {
  const aprRateWithProtocolFee = parseFloat(offer.apr) + BONDS.PROTOCOL_REPAY_FEE
  const aprPercent = aprRateWithProtocolFee / 100

  return (
    <div className={styles.aprRow}>
      <span className={styles.aprValue}>{createPercentValueJSX(aprPercent)}</span>
    </div>
  )
}
