import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import {
  BondAndTransactionOptimistic,
  terminatePerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'
import { MakeActionFn } from 'solana-transactions-executor'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeTerminateActionParams = {
  loan: Loan
}

export type MakeTerminateAction = MakeActionFn<MakeTerminateActionParams, Loan>

interface OptimisticResult extends BondAndTransactionOptimistic {
  bondOffer: BondOfferV2
}

export const makeTerminateAction: MakeTerminateAction = async (
  ixnParams,
  { connection, wallet },
) => {
  const { bondTradeTransaction, fraktBond } = ixnParams.loan || {}

  const { instructions, signers, optimisticResult } = await terminatePerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      bondTradeTransactionV2: new web3.PublicKey(bondTradeTransaction.publicKey),
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: wallet.publicKey as web3.PublicKey,
    },
    optimistic: {
      fraktBond,
      bondOffer: getMockBondOffer(),
      bondTradeTransaction,
    } as OptimisticResult,
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const loanOptimisticResult = {
    ...ixnParams.loan,
    ...optimisticResult,
  }

  return {
    instructions,
    signers,
    additionalResult: loanOptimisticResult,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
