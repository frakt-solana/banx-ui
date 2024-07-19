import { BN, web3 } from 'fbonds-core'

import { coreNew } from '@banx/api/nft'
import { NftWithLoanValue } from '@banx/utils'

export type TableNftData = NftWithLoanValue & {
  mint: web3.PublicKey
  selected: boolean
  interest: BN //? 1 week interest
}

export interface OfferWithLoanValue {
  offer: coreNew.Offer
  loanValue: BN
}
