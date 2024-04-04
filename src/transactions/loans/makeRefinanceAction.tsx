import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import {
  BondAndTransactionOptimistic,
  refinancePerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import {
  BondOfferV2,
  BondTradeTransactionV2,
  FraktBond,
  LendingTokenType,
} from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { PriorityLevel, mergeWithComputeUnits } from '@banx/store'
import { sendTxnPlaceHolder } from '@banx/utils'

export interface RefinanceOptimisticResult {
  oldBondTradeTransaction: BondTradeTransactionV2
  fraktBond: FraktBond
  newBondOffer: BondOfferV2
  newBondTradeTransaction: BondTradeTransactionV2
}

export type MakeRefinanceActionParams = {
  loan: Loan
  priorityFeeLevel: PriorityLevel
}

export type MakeRefinanceAction = CreateTransactionDataFn<MakeRefinanceActionParams, Loan>

interface OptimisticResult extends BondAndTransactionOptimistic {
  oldBondOffer: BondOfferV2
}

export const makeRefinanceAction: MakeRefinanceAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const { loan, priorityFeeLevel } = ixnParams || {}
  const { bondTradeTransaction, fraktBond } = loan

  const {
    instructions: refinanceInstructions,
    signers,
    optimisticResult,
  } = await refinancePerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: wallet.publicKey as web3.PublicKey,
      hadoMarket: new web3.PublicKey(fraktBond.hadoMarket || ''),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      previousBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      previousLender: new web3.PublicKey(bondTradeTransaction.user),
      oldBondOffer: new web3.PublicKey(loan.bondTradeTransaction.bondOffer),
    },
    args: {
      lendingTokenType: LendingTokenType.NativeSol,
    },
    optimistic: {
      fraktBond,
      oldBondOffer: getMockBondOffer(),
      bondTradeTransaction,
    } as OptimisticResult,
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const optimisticLoan = {
    ...loan,
    fraktBond: optimisticResult.fraktBond,
    bondTradeTransaction: optimisticResult.newBondTradeTransaction,
  }

  const instructions = await mergeWithComputeUnits({
    instructions: refinanceInstructions,
    connection: connection,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    payer: wallet.publicKey,
    priorityLevel: priorityFeeLevel,
  })

  return {
    instructions,
    signers,
    result: optimisticLoan,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
