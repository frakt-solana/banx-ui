import { web3 } from 'fbonds-core'
import { BondOfferOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
//TODO: Update imports in SDK
import { updatePerpetualOfferBonding } from 'fbonds-core/lib/fbond-protocol/functions/perpetual/offer/updatePerpetualOfferBonding'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'

import { Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { MakeActionFn } from '../TxnExecutor'

export type MakeUpdateBondingOfferActionParams = {
  loanValue: number //? value in sol
  loansAmount: number
  deltaValue: number //? value in sol
  offerPubkey: string
  optimisticOffer: Offer
}

export type MakeUpdateBondingOfferAction = MakeActionFn<
  MakeUpdateBondingOfferActionParams,
  BondOfferOptimistic
>

export const makeUpdateBondingOfferAction: MakeUpdateBondingOfferAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const { loanValue, loansAmount, deltaValue, offerPubkey, optimisticOffer } = ixnParams

  const { instructions, signers, optimisticResult } = await updatePerpetualOfferBonding({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection,
    accounts: {
      bondOfferV2: new web3.PublicKey(offerPubkey),
      userPubkey: wallet.publicKey as web3.PublicKey,
    },
    optimistic: {
      bondOffer: optimisticOffer as BondOfferV2,
    },
    args: {
      loanValue: loanValue * 1e9,
      delta: deltaValue * 1e9,
      quantityOfLoans: loansAmount,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    additionalResult: optimisticResult,
    lookupTables: [],
  }
}
