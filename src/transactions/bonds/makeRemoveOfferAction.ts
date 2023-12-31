import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  removePerpetualOffer,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'
import { MakeActionFn } from 'solana-transactions-executor'

import { Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeClaimActionParams = {
  optimisticOffer: Offer
}

export type MakeRemoveOfferAction = MakeActionFn<MakeClaimActionParams, BondOfferOptimistic>

export const makeRemoveOfferAction: MakeRemoveOfferAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const { optimisticOffer } = ixnParams

  const { instructions, signers, optimisticResult } = await removePerpetualOffer({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      bondOfferV2: new web3.PublicKey(optimisticOffer.publicKey),
      userPubkey: wallet.publicKey as web3.PublicKey,
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
