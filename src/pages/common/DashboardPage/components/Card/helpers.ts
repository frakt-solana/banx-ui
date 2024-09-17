import { BN } from 'fbonds-core'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { core } from '@banx/api/nft'
import { BONDS, SECONDS_IN_DAY } from '@banx/constants'
import {
  adjustBorrowValueWithSolanaRentFee,
  calculateBorrowValueWithProtocolFee,
  calculateLoanValue,
} from '@banx/utils'

export const calcLoanValueWithFees = (offer: core.Offer | null, tokenType: LendingTokenType) => {
  if (!offer) return 0

  const loanValue = calculateLoanValue(offer)
  const loanValueWithProtocolFee = calculateBorrowValueWithProtocolFee(loanValue)
  return adjustBorrowValueWithSolanaRentFee({
    value: new BN(loanValueWithProtocolFee),
    marketPubkey: offer.hadoMarket,
    tokenType,
  }).toNumber()
}

type CalcWeeklyInterestFee = (props: { loanValue: number; apr: number }) => number
export const calcWeeklyInterestFee: CalcWeeklyInterestFee = ({ loanValue, apr }) => {
  return calculateCurrentInterestSolPure({
    loanValue,
    startTime: 0,
    currentTime: SECONDS_IN_DAY * 7,
    rateBasePoints: apr + BONDS.REPAY_FEE_APR,
  })
}
