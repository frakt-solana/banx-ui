import { web3 } from 'fbonds-core'
import {
  BondOfferOptimistic,
  createPerpetualBondOfferBonding,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondingCurveType, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { PriorityLevel, mergeWithComputeUnits } from '@banx/store'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeCreateBondingOfferActionParams = {
  marketPubkey: string
  loanValue: number //? normal number
  loansAmount: number
  deltaValue: number //? normal number
  tokenType: LendingTokenType
  priorityFeeLevel: PriorityLevel
}

export type MakeCreateBondingOfferAction = CreateTransactionDataFn<
  MakeCreateBondingOfferActionParams,
  BondOfferOptimistic
>

export const makeCreateBondingOfferAction: MakeCreateBondingOfferAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const { marketPubkey, loanValue, loansAmount, tokenType, deltaValue } = ixnParams

  const bondingCurveType =
    tokenType === LendingTokenType.NativeSol ? BondingCurveType.Linear : BondingCurveType.LinearUsdc

  const {
    instructions: createBondingOfferInstructions,
    signers,
    optimisticResult,
  } = await createPerpetualBondOfferBonding({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection,
    accounts: {
      hadoMarket: new web3.PublicKey(marketPubkey),
      userPubkey: wallet.publicKey as web3.PublicKey,
    },
    args: {
      loanValue,
      delta: deltaValue,
      quantityOfLoans: loansAmount,
      bondingCurveType,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const instructions = await mergeWithComputeUnits({
    instructions: createBondingOfferInstructions,
    connection: connection,
    lookupTables: [],
    payer: wallet.publicKey,
    priorityLevel: ixnParams.priorityFeeLevel,
  })

  return {
    instructions,
    signers,
    result: optimisticResult,
    lookupTables: [],
  }
}
