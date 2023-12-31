import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  updatePerpetualOffer,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'
import { MakeActionFn } from 'solana-transactions-executor'

import { Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeUpdateOfferActionParams = {
  offerPubkey: string
  loanValue: number
  loansAmount: number
  optimisticOffer: Offer
}

export type MakeUpdateOfferAction = MakeActionFn<MakeUpdateOfferActionParams, BondOfferOptimistic>

export const makeUpdateOfferAction: MakeUpdateOfferAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const { loanValue, loansAmount, offerPubkey, optimisticOffer } = ixnParams

  const bondOfferV2 = new web3.PublicKey(offerPubkey)
  const userPubkey = wallet.publicKey as web3.PublicKey

  const { instructions, signers, optimisticResult } = await updatePerpetualOffer({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: { bondOfferV2, userPubkey },
    args: {
      loanValue: loanValue * 1e9,
      amountOfLoans: loansAmount,
    },
    optimistic: {
      bondOffer: optimisticOffer as BondOfferV2,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    additionalResult: optimisticResult,
    lookupTables: [],
  }
}
