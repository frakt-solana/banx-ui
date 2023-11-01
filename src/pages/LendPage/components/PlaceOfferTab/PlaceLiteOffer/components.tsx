import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'
import { InputErrorMessage } from '@banx/components/inputs'

import { BONDS, WEEKS_IN_YEAR } from '@banx/constants'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import styles from './PlaceLiteOffer.module.less'

interface OfferSummaryProps {
  offerSize: number
  marketAPR: number
  loanToValuePercent: number
}

export const OfferSummary: FC<OfferSummaryProps> = ({
  offerSize,
  marketAPR,
  loanToValuePercent,
}) => {
  const weeklyAprPercentage = marketAPR / 100 / WEEKS_IN_YEAR
  const estimatedInterest = (offerSize * weeklyAprPercentage) / 100

  const colorLTV = getColorByPercent(loanToValuePercent, HealthColorIncreasing)

  const displayEstimatedInterest = estimatedInterest ? formatDecimal(estimatedInterest) : 0
  const displayOfferSize = offerSize ? formatDecimal(offerSize) : 0

  return (
    <div className={styles.offerSummary}>
      <StatInfo
        label="LTV"
        value={loanToValuePercent}
        valueStyles={{ color: colorLTV }}
        flexType="row"
        valueType={VALUES_TYPES.PERCENT}
      />
      <StatInfo
        label="Offer size"
        value={`${displayOfferSize}◎`}
        flexType="row"
        valueType={VALUES_TYPES.STRING}
      />
      <StatInfo
        label="Weekly interest"
        value={`${displayEstimatedInterest}◎`}
        valueType={VALUES_TYPES.STRING}
        flexType="row"
      />
    </div>
  )
}

interface OfferMessages {
  showDepositErrorMessage: boolean
  showBorrowerMessage: boolean
  loanValue: string
}

export const OfferMessages: FC<OfferMessages> = ({
  showDepositErrorMessage,
  showBorrowerMessage,
  loanValue,
}) => {
  const loanValueToNumber = parseFloat(loanValue) || 0
  const loanValueWithProtocolFee =
    loanValueToNumber - loanValueToNumber * (BONDS.PROTOCOL_FEE_PERCENT / 1e4)

  return (
    <div className={styles.messageContainer}>
      {showBorrowerMessage && (
        <p className={styles.borrowerMessage}>
          Borrower sees: {createSolValueJSX(loanValueWithProtocolFee)}
        </p>
      )}
      {showDepositErrorMessage && <InputErrorMessage message="Not enough SOL" />}
    </div>
  )
}
