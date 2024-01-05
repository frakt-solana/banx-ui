import { MarketPreview, Offer } from '@banx/api/core'
import { WEEKS_IN_YEAR } from '@banx/constants'
import { calcSyntheticLoanValue } from '@banx/store'

interface CalcOfferSizeProps {
  initialOffer: Offer | undefined
  updatedOffer: Offer | undefined
  hasFormChanges: boolean
}

const calcOfferSize = ({ initialOffer, updatedOffer, hasFormChanges }: CalcOfferSizeProps) => {
  const {
    fundsSolOrTokenBalance: updatedFundsSolOrTokenBalance = 0,
    bidSettlement: updatedBidSettlement = 0,
  } = updatedOffer || {}

  const {
    fundsSolOrTokenBalance: initialFundsSolOrTokenBalance = 0,
    bidSettlement: initialBidSettlement = 0,
  } = initialOffer || {}

  const updatedOfferSize = updatedFundsSolOrTokenBalance + updatedBidSettlement
  const initialOfferSize = initialFundsSolOrTokenBalance + initialBidSettlement

  return hasFormChanges ? updatedOfferSize : initialOfferSize
}

export const caclWeeklyInterest = ({ apr, offerSize }: { apr: number; offerSize: number }) => {
  const weeklyAprPercentage = apr / 100 / WEEKS_IN_YEAR
  return (offerSize * weeklyAprPercentage) / 100
}

interface GetSummaryInfoProps {
  initialOffer: Offer | undefined
  updatedOffer: Offer | undefined
  market: MarketPreview | undefined
  hasFormChanges: boolean
}

export const getSummaryInfo = ({
  initialOffer,
  updatedOffer,
  market,
  hasFormChanges,
}: GetSummaryInfoProps) => {
  const { marketApr = 0, collectionFloor = 0 } = market || {}

  const { concentrationIndex: accruedInterest = 0 } = initialOffer || {}

  const offerSize = calcOfferSize({ initialOffer, updatedOffer, hasFormChanges })

  const weeklyInterest = caclWeeklyInterest({ offerSize, apr: marketApr })

  const bestLoanValue = updatedOffer ? calcSyntheticLoanValue(updatedOffer) : 0

  const { maxLtv } =
    calcCurrentAndMaxLtv({ initialOffer, updatedOffer, market, hasFormChanges }) || {}

  return {
    maxLtv,
    offerSize,
    weeklyInterest,
    accruedInterest,
    collectionFloor,
    bestLoanValue,
  }
}

const calcCurrentAndMaxLtv = ({
  initialOffer,
  updatedOffer,
  market,
  hasFormChanges,
}: {
  initialOffer: Offer | undefined
  updatedOffer: Offer | undefined
  market: MarketPreview | undefined
  hasFormChanges: boolean
}) => {
  const collectionFloor = market?.collectionFloor || 0

  //? Calculate initial LTV based on the best offer in the pool
  const bestLoanValue = initialOffer ? calcSyntheticLoanValue(initialOffer) : 0
  const initialCurrentLtv = calcLtv(bestLoanValue, collectionFloor)

  //? Calculate initial maximum LTV when the best offer in the pool was created
  const initialMaxLoanValue = initialOffer?.validation.loanToValueFilter || 0
  const initialMaxLtv = calcLtv(initialMaxLoanValue, collectionFloor)

  //? Calculate updated LTV based on the best offer in the pool when form has changes
  const updatedBestLoanValue = updatedOffer ? calcSyntheticLoanValue(updatedOffer) : 0
  const updatedCurrentLtv = calcLtv(updatedBestLoanValue, collectionFloor) || 0

  const currentLtv = initialOffer && !hasFormChanges ? initialCurrentLtv : updatedCurrentLtv
  const maxLtv = Math.max(currentLtv, initialMaxLtv)

  return { currentLtv, maxLtv }
}

const calcLtv = (loanValue: number, collectionFloor: number) => {
  return Math.max((loanValue / collectionFloor) * 100, 0)
}
