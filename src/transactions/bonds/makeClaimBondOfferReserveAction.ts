import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  claimPerpetualBondOfferReserves,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'
import { MakeActionFn } from 'solana-transactions-executor'

import { Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeClaimOfferReserveActionParams = {
  optimisticOffer: Offer
}

export type MakeClaimBondOfferReserveAction = MakeActionFn<
  MakeClaimOfferReserveActionParams,
  BondOfferOptimistic
>

export const makeClaimBondOfferReserveAction: MakeClaimBondOfferReserveAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const { optimisticOffer } = ixnParams

  const { instructions, signers, optimisticResult } = await claimPerpetualBondOfferReserves({
    accounts: {
      bondOffer: new web3.PublicKey(optimisticOffer.publicKey),
      userPubkey: wallet.publicKey as web3.PublicKey,
    },
    optimistic: {
      bondOffer: optimisticOffer as BondOfferV2,
    },
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
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
