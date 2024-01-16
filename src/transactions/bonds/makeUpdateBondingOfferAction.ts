import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  updatePerpetualOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'
import { MakeActionFn } from 'solana-transactions-executor'

import { Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeUpdateBondingOfferActionParams = {
  loanValue: number //? value in sol
  loansAmount: number
  deltaValue: number //? value in sol
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
  const { loanValue, loansAmount, deltaValue, optimisticOffer } = ixnParams

  const { instructions, signers, optimisticResult } = await updatePerpetualOfferBonding({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection,
    accounts: {
      bondOfferV2: new web3.PublicKey(optimisticOffer.publicKey),
      userPubkey: wallet.publicKey as web3.PublicKey,
    },
    optimistic: {
      bondOffer: optimisticOffer as BondOfferV2,
    },
    args: {
      loanValue,
      delta: deltaValue,
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
