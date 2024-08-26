import { FC } from 'react'

import { BondOfferV3, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import Checkbox from '@banx/components/Checkbox'
import { calculateLtvPercent } from '@banx/components/PlaceTokenOfferSection/helpers'
import {
  calculateTokensPerCollateral,
  formatTokensPerCollateralToStr,
} from '@banx/components/PlaceTokenOfferSection/hooks/useOfferFormController'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'
import { getTokenDecimals } from '@banx/utils'

import { calculateTokenToGet } from '../helpers'

import styles from './OrderBook.module.less'

interface BorrowCellProps {
  loan: core.TokenLoan
  offer: BondOfferV3
  isSelected: boolean
  onClick: () => void
  tokenType: LendingTokenType
}

export const BorrowCell: FC<BorrowCellProps> = ({
  loan,
  offer,
  onClick,
  isSelected,
  tokenType,
}) => {
  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType))

  const tokenToGet = calculateTokenToGet({ offer, loan, marketTokenDecimals })

  const tokensPerCollateral = formatTokensPerCollateralToStr(
    calculateTokensPerCollateral(offer.validation.collateralsPerToken, loan.collateral.decimals),
  )

  const ltvPercent = calculateLtvPercent({
    collateralPerToken: tokensPerCollateral,
    collateralPrice: loan.collateralPrice,
    marketTokenDecimals,
  })

  return (
    <div className={styles.checkboxRow}>
      <Checkbox className={styles.checkbox} onChange={onClick} checked={isSelected} />
      <div className={styles.borrowValueContainer}>
        <DisplayValue value={tokenToGet.toNumber()} />
        <span className={styles.ltvValue}>{createPercentValueJSX(ltvPercent)} LTV</span>
      </div>
    </div>
  )
}

interface AprCellProps {
  offer: BondOfferV3
}

export const AprCell: FC<AprCellProps> = ({ offer }) => {
  const aprRateWithProtocolFee = offer.loanApr.toNumber() + BONDS.PROTOCOL_REPAY_FEE
  const aprPercent = aprRateWithProtocolFee / 100

  return (
    <div className={styles.aprRow}>
      <span className={styles.aprValue}>{createPercentValueJSX(aprPercent)}</span>
    </div>
  )
}
