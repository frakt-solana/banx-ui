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

import { createPriorityFeesInstruction } from '../helpers'

export type MakeClaimActionParams = {
  optimisticOffer: Offer
}

export type MakeRemoveOfferAction = CreateTransactionDataFn<
  MakeClaimActionParams,
  BondOfferOptimistic
>

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
    args: {
      lendingTokenType: LendingTokenType.NativeSOL,
    },
    optimistic: {
      bondOffer: optimisticOffer as BondOfferV2,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const priorityFeeInstruction = await createPriorityFeesInstruction(instructions, connection)

  return {
    instructions: [...instructions, priorityFeeInstruction],
    signers,
    result: optimisticResult,
  }
}
