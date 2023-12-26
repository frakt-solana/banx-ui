import { MarketPreview, Offer } from '@banx/api/core'
import { WEEKS_IN_YEAR } from '@banx/constants'

export const caclWeeklyInterest = ({ apr, offerSize }: { apr: number; offerSize: number }) => {
  const weeklyAprPercentage = apr / 100 / WEEKS_IN_YEAR
  const weeklyInterest = (offerSize * weeklyAprPercentage) / 100

  return weeklyInterest
}

type CalcOfferSize = (props: {
  initialOffer: Offer | undefined
  updatedOffer: Offer | undefined
  hasFormChanges: boolean
}) => number

export const calcOfferSize: CalcOfferSize = ({ initialOffer, updatedOffer, hasFormChanges }) => {
  const {
    edgeSettlement: initialEdgeSettlement = 0,
    fundsSolOrTokenBalance: initialFundsSolOrTokenBalance = 0,
    bidSettlement: initialBidSettlemet = 0,
  } = initialOffer || {}

  const {
    fundsSolOrTokenBalance: updatedFundsSolOrTokenBalance = 0,
    bidSettlement: updatedBidSettlemet = 0,
  } = updatedOffer || {}

  const initialOfferSize =
    initialEdgeSettlement + initialFundsSolOrTokenBalance + initialBidSettlemet

  const updatedOfferSize = updatedFundsSolOrTokenBalance + updatedBidSettlemet

  return hasFormChanges ? initialOfferSize : updatedOfferSize
}

type GetSummaryInfo = (props: {
  initialOffer: Offer | undefined
  updatedOffer: Offer | undefined
  market: MarketPreview | undefined
  hasFormChanges: boolean
}) => any

export const getSummaryInfo: GetSummaryInfo = ({
  initialOffer,
  updatedOffer,
  market,
  hasFormChanges,
}) => {
  const { marketApr = 0 } = market || {}

  const offerSize = calcOfferSize({ initialOffer, updatedOffer, hasFormChanges })
  const weeklyInterest = caclWeeklyInterest({ apr: marketApr, offerSize })

  const initialLoansQuantity = initialOffer?.validation?.maxReturnAmountFilter || 0

  return {
    offerSize,
    weeklyInterest,
    initialLoansQuantity,
  }
}
