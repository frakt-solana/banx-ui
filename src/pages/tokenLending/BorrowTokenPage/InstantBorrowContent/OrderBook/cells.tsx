import { FC } from 'react'

import { BN, web3 } from 'fbonds-core'
import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { BorrowOffer } from '@banx/api/tokens'
import { ZERO_BN, adjustTokenAmountWithUpfrontFee, getTokenDecimals } from '@banx/utils'

import styles from './OrderBook.module.less'

interface BorrowCellProps {
  offer: BorrowOffer
  selectedOffer: BorrowOffer | null
  restCollateralsAmount: BN
  tokenType: LendingTokenType
}

export const BorrowCell: FC<BorrowCellProps> = ({
  offer,
  selectedOffer,
  restCollateralsAmount,
  tokenType,
}) => {
  const tokenDecimals = Math.log10(getTokenDecimals(tokenType))
  const collateralMultiplier = Math.pow(10, tokenDecimals)

  const ltvPercent = parseFloat(offer.ltv) / 100

  const calculatedTokenToGet = BN.min(
    restCollateralsAmount.mul(new BN(collateralMultiplier)).div(new BN(offer.collateralsPerToken)),
    new BN(offer.maxTokenToGet),
  )

  const selectedOfferMaxTokenToGet = selectedOffer ? new BN(selectedOffer.maxTokenToGet) : ZERO_BN

  const borrowValueBN = !selectedOfferMaxTokenToGet.isZero()
    ? selectedOfferMaxTokenToGet
    : calculatedTokenToGet

  const adjustedBorrowValueToDisplay = adjustTokenAmountWithUpfrontFee(borrowValueBN)

  return (
    <div className={styles.borrowValueContainer}>
      <DisplayValue value={adjustedBorrowValueToDisplay.toNumber()} />
      <span className={styles.ltvValue}>{createPercentValueJSX(ltvPercent)} LTV</span>
    </div>
  )
}

interface AprCellProps {
  offer: BorrowOffer
  marketPubkey: string
}

export const AprCell: FC<AprCellProps> = ({ offer, marketPubkey }) => {
  const aprPercent =
    calcBorrowerTokenAPR(parseFloat(offer.apr), new web3.PublicKey(marketPubkey)) / 100

  return (
    <div className={styles.aprRow}>
      <span className={styles.aprValue}>{createPercentValueJSX(aprPercent)}</span>
    </div>
  )
}
