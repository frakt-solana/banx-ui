import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  removePerpetualOffer,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { createInstructionsWithPriorityFees } from '../helpers'

export type MakeClaimActionParams = {
  optimisticOffer: Offer
  tokenType: LendingTokenType
}

export type MakeRemoveOfferAction = CreateTransactionDataFn<
  MakeClaimActionParams,
  BondOfferOptimistic
>

export const makeRemoveOfferAction: MakeRemoveOfferAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const { optimisticOffer, tokenType } = ixnParams

  const { instructions, signers, optimisticResult } = await removePerpetualOffer({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      bondOfferV2: new web3.PublicKey(optimisticOffer.publicKey),
      userPubkey: wallet.publicKey as web3.PublicKey,
    },
    args: {
      lendingTokenType: tokenType,
    },
    optimistic: {
      bondOffer: optimisticOffer as BondOfferV2,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const instructionsWithPriorityFees = await createInstructionsWithPriorityFees(
    instructions,
    connection,
  )

  return {
    instructions: instructionsWithPriorityFees,
    signers,
    result: optimisticResult,
  }
}
