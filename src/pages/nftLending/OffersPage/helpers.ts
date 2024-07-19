import { BN } from 'fbonds-core'
import { chain, first } from 'lodash'

import { coreNew } from '@banx/api/nft'
import {
  ZERO_BN,
  calculateBorrowedAmount,
  calculateLoanRepayValue,
  calculateLoanValue,
  isLoanLiquidated,
  isLoanTerminating,
} from '@banx/utils'

type IsLoanAbleToClaim = (loan: coreNew.Loan) => boolean
export const isLoanAbleToClaim: IsLoanAbleToClaim = (loan) => {
  const isTerminatingStatus = isLoanTerminating(loan)
  const isLoanExpired = isLoanLiquidated(loan)

  return isLoanExpired && isTerminatingStatus
}

type IsLoanAbleToTerminate = (loan: coreNew.Loan) => boolean
export const isLoanAbleToTerminate: IsLoanAbleToTerminate = (loan) => {
  const isLoanExpired = isLoanLiquidated(loan)
  const isTerminatingStatus = isLoanTerminating(loan)

  return !isLoanExpired && !isTerminatingStatus
}

type FindBestOffer = (props: {
  loan: coreNew.Loan
  offers: coreNew.Offer[]
  walletPubkey: string
}) => coreNew.Offer
export const findBestOffer: FindBestOffer = ({ loan, offers, walletPubkey }) => {
  const filteredOffers: coreNew.Offer[] = chain(offers)
    .filter(
      (offer) =>
        offer.hadoMarket === loan.fraktBond.hadoMarket &&
        offer.assetReceiver.toBase58() !== walletPubkey,
    )
    .filter((offer) => calculateLoanValue(offer).gt(calculateLoanRepayValue(loan)))
    .sortBy((offer) => offer.fundsSolOrTokenBalance)
    .value()

  return first(filteredOffers)!
}

export const calculateLentValue = (loan: coreNew.Loan): BN => {
  const totalRepaidAmount = loan.totalRepaidAmount || ZERO_BN

  const loanBorrowedAmount = calculateBorrowedAmount(loan)

  return loanBorrowedAmount.add(totalRepaidAmount)
}
