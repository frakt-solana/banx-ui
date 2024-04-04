import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  updatePerpetualOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { PriorityLevel, mergeWithComputeUnits } from '@banx/store'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeUpdateBondingOfferActionParams = {
  loanValue: number //? value in sol
  loansAmount: number
  deltaValue: number //? value in sol
  optimisticOffer: Offer
  priorityFeeLevel: PriorityLevel
}

export type MakeUpdateBondingOfferAction = CreateTransactionDataFn<
  MakeUpdateBondingOfferActionParams,
  BondOfferOptimistic
>

export const makeUpdateBondingOfferAction: MakeUpdateBondingOfferAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const { loanValue, loansAmount, deltaValue, optimisticOffer, priorityFeeLevel } = ixnParams

  const {
    instructions: updateBondingOfferInstructions,
    signers,
    optimisticResult,
  } = await updatePerpetualOfferBonding({
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
      lendingTokenType: LendingTokenType.NativeSol,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const instructions = await mergeWithComputeUnits({
    instructions: updateBondingOfferInstructions,
    connection: connection,
    lookupTables: [],
    payer: wallet.publicKey,
    priorityLevel: priorityFeeLevel,
  })

  return {
    instructions,
    signers,
    result: optimisticResult,
    lookupTables: [],
  }
}
