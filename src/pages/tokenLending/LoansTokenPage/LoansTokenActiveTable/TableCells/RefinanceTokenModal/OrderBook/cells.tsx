import { FC } from 'react'

import classNames from 'classnames'
import { BN } from 'fbonds-core'
import { BondOfferV3, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { Button } from '@banx/components/Buttons'
import {
  calculateLtvPercent,
  formatLeadingZeros,
} from '@banx/components/PlaceTokenOfferSection/helpers'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import {
  adjustAmountWithUpfrontFee,
  caclulateBorrowTokenLoanValue,
  calculateTokensPerCollateral,
  convertToHumanNumber,
  formatTokensPerCollateralToStr,
  getDecimalPlaces,
  getTokenDecimals,
  getTokenUnit,
} from '@banx/utils'

import { calculateTokensToGet } from '../../../helpers'

import styles from './OrderBook.module.less'

interface BorrowCellProps {
  loan: core.TokenLoan
  offer: BondOfferV3
  tokenType: LendingTokenType
}

export const BorrowCell: FC<BorrowCellProps> = ({ loan, offer, tokenType }) => {
  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType))

  const loanDebt = calculateTokensToGet({ offer, loan, marketTokenDecimals })
  const borrowValue = adjustAmountWithUpfrontFee(loanDebt)

  const tokensPerCollateral = formatTokensPerCollateralToStr(
    calculateTokensPerCollateral(offer.validation.collateralsPerToken, loan.collateral.decimals),
  )

  const ltvPercent = calculateLtvPercent({
    collateralPerToken: tokensPerCollateral,
    collateralPrice: loan.collateralPrice,
    marketTokenDecimals,
  })

  return (
    <div className={styles.borrowValueInfo}>
      <DisplayValue value={borrowValue.toNumber()} />
      <span className={styles.cellValue}>{createPercentValueJSX(ltvPercent)} LTV</span>
    </div>
  )
}

interface AprCellProps {
  offer: BondOfferV3
}

export const AprCell: FC<AprCellProps> = ({ offer }) => {
  const aprRateWithProtocolFee = offer.loanApr.toNumber()
  const aprPercent = aprRateWithProtocolFee / 100

  return <span className={styles.cellValue}>{createPercentValueJSX(aprPercent)}</span>
}

interface DebtCellProps {
  loan: core.TokenLoan
  offer: BondOfferV3
  tokenType: LendingTokenType
}

export const DebtCell: FC<DebtCellProps> = ({ offer, loan, tokenType }) => {
  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType)) //? 1e9 => 9, 1e6 => 6
  const loanDebt = calculateTokensToGet({ offer, loan, marketTokenDecimals })

  return (
    <span className={styles.cellValue}>
      <DisplayValue value={loanDebt.toNumber()} />
    </span>
  )
}

interface ActionCellProps {
  loan: core.TokenLoan
  offer: BondOfferV3
  tokenType: LendingTokenType
  refinance: (offer: BondOfferV3, tokensToRefinance: BN) => void
}

export const ActionCell: FC<ActionCellProps> = ({ loan, offer, tokenType, refinance }) => {
  const currentLoanDebt = caclulateBorrowTokenLoanValue(loan).toNumber()
  const marketTokenDecimals = Math.log10(getTokenDecimals(tokenType)) //? 1e9 => 9, 1e6 => 6

  const newLoanDebt = calculateTokensToGet({ offer, loan, marketTokenDecimals })
  const newLoanDebtNumber = newLoanDebt.toNumber()

  const debtDifference = newLoanDebtNumber - currentLoanDebt
  const upfrontFee = Math.max(debtDifference / 100, 0)
  const payableDifference = debtDifference - upfrontFee

  const humanReadableDifference = convertToHumanNumber(payableDifference, tokenType)
  const tokenDecimalPlaces = getDecimalPlaces(humanReadableDifference, tokenType)
  const tokenUnit = getTokenUnit(tokenType)

  const formattedDifference = formatLeadingZeros(humanReadableDifference, tokenDecimalPlaces)

  const formattedDifferenceNumber = parseFloat(formattedDifference)

  const displayValue = Math.abs(formattedDifferenceNumber) !== 0 ? formattedDifferenceNumber : 0
  const isNegativeDifference = displayValue < 0

  const showPlusSign = !isNegativeDifference && displayValue !== 0

  return (
    <Button
      onClick={() => refinance(offer, newLoanDebt)}
      variant="secondary"
      size="small"
      className={classNames(styles.refinanceModalButton, {
        [styles.negative]: isNegativeDifference,
      })}
    >
      Renew
      <p className={styles.differenceValue}>
        {showPlusSign && '+'}
        {displayValue} {tokenUnit}
      </p>
    </Button>
  )
}
