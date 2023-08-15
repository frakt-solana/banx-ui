import { BondTradeTransactionV2, FraktBond } from 'fbonds-core/lib/fbond-protocol/types'

import { Meta } from '@banx/types'

export interface Loan {
  publicKey: string
  fraktBond: FraktBond
  bondTradeTransaction: BondTradeTransactionV2

  nft: {
    mint: string
    meta: {
      collectionSlug: string
      imageUrl: string
      name: string
      collectionName: string
      collectionImage: string
    }
  }
}

export interface WalletLoansResponse {
  data: Loan[]
  meta: Meta
}
