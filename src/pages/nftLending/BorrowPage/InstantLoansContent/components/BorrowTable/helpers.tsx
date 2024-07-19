import { BN } from 'fbonds-core'
import { calculateCurrentInterestSolPureBN } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { coreNew } from '@banx/api/nft'
import bonkTokenImg from '@banx/assets/BonkToken.png'
import { BONDS, ONE_WEEK_IN_SECONDS } from '@banx/constants'
import { ZERO_BN, enqueueSnackbar } from '@banx/utils'

import { CartState } from '../../cartState'
import { TableNftData } from './types'

import styles from './BorrowTable.module.less'

type CalcInterest = (props: { loanValue: BN; timeInterval: number; apr: BN }) => BN
export const calcInterest: CalcInterest = ({ loanValue, timeInterval, apr }) => {
  const currentTimeUnix = moment().unix()

  return calculateCurrentInterestSolPureBN({
    loanValue,
    startTime: new BN(currentTimeUnix - timeInterval),
    currentTime: new BN(currentTimeUnix),
    rateBasePoints: apr.add(BONDS.PROTOCOL_REPAY_FEE_BN),
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
  nfts: coreNew.BorrowNft[]
  findOfferInCart: CartState['findOfferInCart']
  findBestOffer: CartState['findBestOffer']
  maxLoanValueByMarket: Record<string, number>
  maxBorrowPercent: number
}): TableNftData[] => {
  return nfts.map((nft) => {
    const offer = findOfferInCart({ mint: nft.mint.toBase58() })

    const maxloanValue =
      offer?.loanValue ||
      findBestOffer({ marketPubkey: nft.loan.marketPubkey.toBase58() })?.loanValue ||
      ZERO_BN

    const loanValue = calcAdjustedLoanValueByMaxByMarket({
      loanValue: maxloanValue.toNumber(),
      maxLoanValueOnMarket: maxLoanValueByMarket[nft.loan.marketPubkey.toBase58()] || 0,
      maxBorrowPercent,
    })

    const selected = !!offer

    const interest = calcInterest({
      timeInterval: ONE_WEEK_IN_SECONDS,
      loanValue: new BN(loanValue),
      apr: nft.loan.marketApr,
    })

    return { mint: nft.mint, nft, loanValue: new BN(loanValue), selected, interest }
  })
}

export const showBonkRewardsSnack = () => {
  enqueueSnackbar({
    className: styles.bonkRewardsSnack,
    message: 'You got a 50% $BONK cashback claimable on the Rewards page!',
    icon: <img src={bonkTokenImg} alt="Bonk token" className={styles.bonkRewardsSnackIcon} />,
  })
}
