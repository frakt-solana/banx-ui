import { MarketPreview, Offer } from '@banx/api/core'
import { WEEKS_IN_YEAR } from '@banx/constants'

export const caclWeeklyInterest = ({ apr, offerSize }: { apr: number; offerSize: number }) => {
  const weeklyAprPercentage = apr / 100 / WEEKS_IN_YEAR
  const weeklyInterest = (offerSize * weeklyAprPercentage) / 100

  return weeklyInterest
}

export const calcOfferSize = (offer: Offer | undefined) => {
  const { fundsSolOrTokenBalance = 0, bidSettlement = 0 } = offer || {}
  return fundsSolOrTokenBalance + bidSettlement
}

interface GetSummaryInfoProps {
  initialOffer: Offer | undefined
  updatedOffer: Offer | undefined
  market: MarketPreview | undefined
}

export const getSummaryInfo = ({ initialOffer, updatedOffer, market }: GetSummaryInfoProps) => {
  const { concentrationIndex: accruedInterest = 0, edgeSettlement: lentValue = 0 } =
    initialOffer || {}

  const { marketApr = 0 } = market || {}

  const offerSize = calcOfferSize(updatedOffer)

  const weeklyInterest = caclWeeklyInterest({ offerSize, apr: marketApr })
  const initialLoansQuantity = initialOffer?.validation?.maxReturnAmountFilter || 0

  const { currentLtv, maxLtv } =
    calcCurrentAndMaxLtv({ initialOffer, updatedOffer, market, offerSize }) || {}

  return {
    maxLtv,
    currentLtv,
    offerSize,
    weeklyInterest,
    initialLoansQuantity,
    accruedInterest,
    lentValue,
  }
}

const calcCurrentAndMaxLtv = ({
  initialOffer,
  updatedOffer,
  market,
  offerSize,
}: {
  initialOffer: Offer | undefined
  updatedOffer: Offer | undefined
  market: MarketPreview | undefined
  offerSize: number
}) => {
  const { collectionFloor = 0 } = market || {}

  const initialMaxLoanValue = initialOffer?.validation.loanToValueFilter || 0
  const maxLtv = (initialMaxLoanValue / collectionFloor) * 100

  const loansQuantity = updatedOffer?.buyOrdersQuantity || 0
  const currentLtv = (offerSize / loansQuantity / collectionFloor) * 100 || 0

  return { currentLtv, maxLtv: Math.max(currentLtv, maxLtv) }
}
