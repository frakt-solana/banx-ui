import { BN } from 'fbonds-core'
import { reduce } from 'lodash'

import { core } from '@banx/api/nft'

export const calcWeightedAverage = (nums: number[], weights: number[]) => {
  //TODO r: Move to somewhere
  const [sum, weightSum] = reduce(
    weights,
    (acc, weight, i) => {
      acc[0] += nums[i] * weight
      acc[1] += weight
      return acc
    },
    [0, 0],
  )

  const weightedAverage = sum / weightSum
  return weightedAverage || 0
}

export const calculateIdleFundsInOffer = (offer: core.Offer): BN => {
  const { fundsSolOrTokenBalance, bidSettlement, concentrationIndex } = offer
  return new BN(fundsSolOrTokenBalance).add(new BN(bidSettlement)).add(new BN(concentrationIndex))
}

export * from './loans'
export * from './offers'
export * from './tokenLoans'
