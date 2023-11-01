import {
  calculateNextSpotPrice,
  getSumOfOrdersSeries,
} from 'fbonds-core/lib/fbond-protocol/helpers'
import { BondingCurveType, OrderType } from 'fbonds-core/lib/fbond-protocol/types'

type CalculateOfferSize = (props: {
  loanValue: number //? value in SOL
  deltaValue: number //? value in SOL
  amountOfOrders: number
}) => number

export const calculateOfferSize: CalculateOfferSize = ({
  loanValue,
  deltaValue,
  amountOfOrders,
}) => {
  const deltaValueInLamports = deltaValue * 1e9
  const loanValueInLamports = loanValue * 1e9

  const newBaseSpotPrice = calculateNextSpotPrice({
    orderType: OrderType.Sell,
    bondingCurveType: BondingCurveType.Linear,
    spotPrice: loanValueInLamports,
    delta: deltaValueInLamports,
    counter: 0 * -1 + 1,
  })

  const newBuyOrdersSize = getSumOfOrdersSeries({
    orderType: OrderType.Sell,
    bondingCurveType: BondingCurveType.Linear,
    amountOfOrders,
    delta: deltaValueInLamports,
    spotPrice: newBaseSpotPrice,
    counter: 0,
  })

  return newBuyOrdersSize
}
