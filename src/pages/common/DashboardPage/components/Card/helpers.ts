import { BN } from 'fbonds-core'
import { calculateCurrentInterestSolPureBN } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { coreNew } from '@banx/api/nft'
import { BONDS, SECONDS_IN_DAY } from '@banx/constants'
import {
  ZERO_BN,
  adjustBorrowValueWithSolanaRentFee,
  calculateBorrowValueWithProtocolFee,
  calculateLoanValue,
} from '@banx/utils'

export const calcLoanValueWithFees = (offer: coreNew.Offer | null, tokenType: LendingTokenType) => {
  if (!offer) return 0

  const loanValue = calculateLoanValue(offer)
  const loanValueWithProtocolFee = calculateBorrowValueWithProtocolFee(loanValue)
  return adjustBorrowValueWithSolanaRentFee({
    value: new BN(loanValueWithProtocolFee),
    marketPubkey: offer.hadoMarket.toBase58(),
    tokenType,
  }).toNumber()
}

type CalcWeeklyInterestFee = (props: { loanValue: BN; apr: BN }) => BN
export const calcWeeklyInterestFee: CalcWeeklyInterestFee = ({ loanValue, apr }) => {
  return calculateCurrentInterestSolPureBN({
    loanValue,
    startTime: ZERO_BN,
    currentTime: new BN(SECONDS_IN_DAY * 7),
    rateBasePoints: apr.add(BONDS.PROTOCOL_REPAY_FEE_BN),
  })
}
