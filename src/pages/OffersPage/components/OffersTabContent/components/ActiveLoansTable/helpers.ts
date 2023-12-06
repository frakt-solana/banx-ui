import { chain, first } from 'lodash'

import { Loan, Offer } from '@banx/api/core'
import {
  calculateLoanRepayValue,
  calculateLoanValue,
  isLoanLiquidated,
  isLoanTerminating,
  isUnderWaterLoan,
} from '@banx/utils'

type IsLoanAbleToClaim = (loan: Loan) => boolean
export const isLoanAbleToClaim: IsLoanAbleToClaim = (loan) => {
  const isTerminatingStatus = isLoanTerminating(loan)
  const isLoanExpired = isLoanLiquidated(loan)

  return isLoanExpired && isTerminatingStatus
}

type IsLoanAbleToTerminate = (props: {
  loan: Loan
  offers: Offer[]
  walletPubkey: string
}) => boolean
export const isLoanAbleToTerminate: IsLoanAbleToTerminate = ({
  loan,
  offers,
  walletPubkey = '',
}) => {
  const isLoanExpired = isLoanLiquidated(loan)
  const isTerminatingStatus = isLoanTerminating(loan)
  const hasRefinanceOffers = findBestOffer({ loan, offers, walletPubkey })
  const isLoanUnderWater = isUnderWaterLoan(loan)

  return !isLoanExpired && !isTerminatingStatus && !hasRefinanceOffers && isLoanUnderWater
}

type FindBestOffer = (props: { loan: Loan; offers: Offer[]; walletPubkey: string }) => Offer
export const findBestOffer: FindBestOffer = ({ loan, offers, walletPubkey }) => {
  const filteredOffers = chain(offers)
    .filter(
      (offer) =>
        offer.hadoMarket === loan.fraktBond.hadoMarket && offer.assetReceiver !== walletPubkey,
    )
    .filter((offer) => calculateLoanValue(offer) > calculateLoanRepayValue(loan))
    .sortBy((offer) => offer.fundsSolOrTokenBalance)
    .value()

  return first(filteredOffers) as Offer
}
