import { DAYS_IN_YEAR } from '@banx/constants'

type CalcDailyInterestFee = (props: { apr: number; collectionFloor: number }) => number

export const calcDailyInterestFee: CalcDailyInterestFee = ({ apr, collectionFloor }) => {
  const aprInDecimal = apr / 1e4
  const dailyRate = aprInDecimal / DAYS_IN_YEAR
  const dailyFee = (dailyRate * collectionFloor) / 1e9

  return dailyFee
}
