import { reduce } from 'lodash'

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

export * from './loans'
export * from './offers'
