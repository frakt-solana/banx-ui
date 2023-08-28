import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

type CalcInterest = (props: { loanValue: number; timeInterval: number; apr: number }) => number
export const calcInterest: CalcInterest = ({ loanValue, timeInterval, apr }) => {
  const currentTimeUnix = moment().unix()

  return calculateCurrentInterestSolPure({
    loanValue,
    startTime: currentTimeUnix - timeInterval,
    currentTime: currentTimeUnix,
    rateBasePoints: apr,
  })
}
