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

type CalculateOfferSizeParams = {
  loanValue: number
  loansAmount: number
  deltaValue: number
}
export const calculateOfferSize = ({
  loanValue,
  loansAmount,
  deltaValue,
}: CalculateOfferSizeParams): number => {
  //? Sum of arithmetic progression
  const a_n = loanValue - deltaValue * (loansAmount - 1)
  const S = ((loanValue + a_n) * loansAmount) / 2

  return S
}

export * from './loans'
export * from './offers'
