import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { chain, first } from 'lodash'
import moment from 'moment'

import { Loan, Offer } from '@banx/api/core'
import { convertOffersToSimple } from '@banx/pages/BorrowPage'
import {
  calcLoanBorrowedAmount,
  calculateLoanRepayValue,
  calculateLoanValue,
  isLoanLiquidated,
  isLoanTerminating,
} from '@banx/utils'

type IsLoanAbleToClaim = (loan: Loan) => boolean
export const isLoanAbleToClaim: IsLoanAbleToClaim = (loan) => {
  const isTerminatingStatus = isLoanTerminating(loan)
  const isLoanExpired = isLoanLiquidated(loan)

  return isLoanExpired && isTerminatingStatus
}

type IsLoanAbleToTerminate = (loan: Loan) => boolean
export const isLoanAbleToTerminate: IsLoanAbleToTerminate = (loan) => {
  const isLoanExpired = isLoanLiquidated(loan)
  const isTerminatingStatus = isLoanTerminating(loan)

  return !isLoanExpired && !isTerminatingStatus
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

export const calculateLentValue = (loan: Loan) => {
  const totalRepaidAmount = loan.totalRepaidAmount || 0

  const loanBorrowedAmount = calcLoanBorrowedAmount(loan)

  return loanBorrowedAmount + totalRepaidAmount
}

export const calculateClaimValue = (loan: Loan) => {
  const { amountOfBonds, soldAt } = loan.bondTradeTransaction

  const loanBorrowedAmount = calcLoanBorrowedAmount(loan)

  const interestParameters = {
    loanValue: loanBorrowedAmount,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: amountOfBonds,
  }

  const currentInterest = calculateCurrentInterestSolPure(interestParameters)
  return currentInterest + loanBorrowedAmount
}

type FindSuitableOffer = (props: {
  loan: Loan
  offers: Offer[]
  walletPubkey: string
}) => Offer | undefined
export const findSuitableOffer: FindSuitableOffer = ({ loan, offers, walletPubkey }) => {
  const loanValue = calculateLoanRepayValue(loan)

  //? Filter out users offers
  const fiteredOffers = offers.filter((offer) => offer.assetReceiver !== walletPubkey)

  //? Create simple offers array sorted by loanValue (offerValue) asc
  const simpleOffers = convertOffersToSimple(fiteredOffers, 'asc')

  //? Find offer. OfferValue must be <= than selected loanValue
  const simpleOffer = simpleOffers.find(({ loanValue: offerValue }) => loanValue <= offerValue)

  return offers.find(({ publicKey }) => publicKey === simpleOffer?.publicKey)
}
