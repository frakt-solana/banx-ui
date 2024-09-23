import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { core } from '@banx/api/nft'
import { BONDS, ONE_WEEK_IN_SECONDS } from '@banx/constants'

import { CartState } from '../../cartState'

type CalcInterest = (props: { loanValue: number; timeInterval: number; apr: number }) => number
export const calcInterest: CalcInterest = ({ loanValue, timeInterval, apr }) => {
  const currentTimeUnix = moment().unix()

  return calculateCurrentInterestSolPure({
    loanValue,
    startTime: currentTimeUnix - timeInterval,
    currentTime: currentTimeUnix,
    rateBasePoints: apr + BONDS.REPAY_FEE_APR,
  })
}

type CalcAdjustedLoanValueByMaxByMarket = (props: {
  loanValue: number
  maxLoanValueOnMarket: number
  maxBorrowPercent: number
}) => number
const calcAdjustedLoanValueByMaxByMarket: CalcAdjustedLoanValueByMaxByMarket = ({
  loanValue,
  maxLoanValueOnMarket,
  maxBorrowPercent,
}) => {
  return Math.min(loanValue, maxLoanValueOnMarket * (maxBorrowPercent / 100)) || 0
}

export const createTableNftData = ({
  nfts,
  findOfferInCart,
  findBestOffer,
  maxLoanValueByMarket,
  maxBorrowPercent,
}: {
  nfts: core.BorrowNft[]
  findOfferInCart: CartState['findOfferInCart']
  findBestOffer: CartState['findBestOffer']
  maxLoanValueByMarket: Record<string, number>
  maxBorrowPercent: number
}) => {
  return nfts.map((nft) => {
    const offer = findOfferInCart({ mint: nft.mint })

    const maxloanValue =
      offer?.loanValue || findBestOffer({ marketPubkey: nft.loan.marketPubkey })?.loanValue || 0

    const loanValue = calcAdjustedLoanValueByMaxByMarket({
      loanValue: maxloanValue,
      maxLoanValueOnMarket: maxLoanValueByMarket[nft.loan.marketPubkey] || 0,
      maxBorrowPercent,
    })

    const selected = !!offer

    const interest = calcInterest({
      timeInterval: ONE_WEEK_IN_SECONDS,
      loanValue: loanValue,
      apr: nft.loan.marketApr,
    })

    return { mint: nft.mint, nft, loanValue, selected, interest }
  })
}
