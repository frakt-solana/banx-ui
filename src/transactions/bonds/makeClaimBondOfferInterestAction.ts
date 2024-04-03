import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  claimPerpetualBondOfferInterest,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { createPriorityFeesInstruction } from '@banx/store'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeClaimOfferInterestActionParams = {
  optimisticOffer: Offer
}

export type MakeClaimBondOfferInterestAction = CreateTransactionDataFn<
  MakeClaimOfferInterestActionParams,
  BondOfferOptimistic
>

export const makeClaimBondOfferInterestAction: MakeClaimBondOfferInterestAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const { optimisticOffer } = ixnParams

  const { instructions, signers, optimisticResult } = await claimPerpetualBondOfferInterest({
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

  const priorityFeeInstruction = await createPriorityFeesInstruction(instructions, connection)

  return {
    instructions: [...instructions, priorityFeeInstruction],
    signers,
    result: optimisticResult,
    lookupTables: [],
  }
}
