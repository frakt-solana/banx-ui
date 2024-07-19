import { BN } from 'fbonds-core'

import { coreNew } from '@banx/api/nft'
import { WEEKS_IN_YEAR } from '@banx/constants'
import { calcSyntheticLoanValue } from '@banx/store/nft'
import { ZERO_BN } from '@banx/utils'

interface CalcOfferSizeProps {
  initialOffer: coreNew.Offer | undefined
  updatedOffer: coreNew.Offer | undefined
  hasFormChanges: boolean
}

export const calcOfferSize = ({
  initialOffer,
  updatedOffer,
  hasFormChanges,
}: CalcOfferSizeProps): BN => {
  const {
    fundsSolOrTokenBalance: updatedFundsSolOrTokenBalance = ZERO_BN,
    bidSettlement: updatedBidSettlement = ZERO_BN,
  } = updatedOffer || {}

  const {
    fundsSolOrTokenBalance: initialFundsSolOrTokenBalance = ZERO_BN,
    bidSettlement: initialBidSettlement = ZERO_BN,
  } = initialOffer || {}

  const updatedOfferSize = updatedFundsSolOrTokenBalance.add(updatedBidSettlement)
  const initialOfferSize = initialFundsSolOrTokenBalance.add(initialBidSettlement)

  return hasFormChanges ? updatedOfferSize : initialOfferSize
}

export const caclWeeklyInterest = ({ apr, offerSize }: { apr: number; offerSize: number }) => {
  const weeklyAprPercentage = apr / 100 / WEEKS_IN_YEAR
  return (offerSize * weeklyAprPercentage) / 100
}

export const calcMaxLtv = ({
  initialOffer,
  updatedOffer,
  collectionFloor,
  hasFormChanges,
}: {
  initialOffer: coreNew.Offer | undefined
  updatedOffer: coreNew.Offer | undefined
  collectionFloor: number
  hasFormChanges: boolean
}) => {
  //? Calculate initial LTV based on the best offer in the pool
  const bestLoanValue = initialOffer ? calcSyntheticLoanValue(initialOffer) : ZERO_BN
  const initialCurrentLtv = calcLtv(bestLoanValue.toNumber(), collectionFloor)

  //? Calculate initial maximum LTV when the best offer in the pool was created
  const initialMaxLoanValue = initialOffer?.validation.loanToValueFilter || ZERO_BN
  const initialMaxLtv = calcLtv(initialMaxLoanValue.toNumber(), collectionFloor)

  //? Calculate updated LTV based on the best offer in the pool when form has changes
  const updatedBestLoanValue = updatedOffer ? calcSyntheticLoanValue(updatedOffer) : ZERO_BN
  const updatedCurrentLtv = calcLtv(updatedBestLoanValue.toNumber(), collectionFloor) || 0

  const currentLtv = initialOffer && !hasFormChanges ? initialCurrentLtv : updatedCurrentLtv

  const result = Math.max(currentLtv, initialMaxLtv)
  return isFinite(result) ? result : 0
}

const calcLtv = (loanValue: number, collectionFloor: number) => {
  return Math.max((loanValue / collectionFloor) * 100, 0)
}
