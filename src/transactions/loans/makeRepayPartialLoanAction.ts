import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  BondAndTransactionOptimistic,
  repayPartialPerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { MakeActionFn } from '../TxnExecutor'

export type MakeRepayPartialLoanActionParams = {
  loan: Loan
  fractionToRepay: number //? F.E 50% => 5000
}

export type MakeRepayPartialActionResult = Loan

export type MakeRepayPartialLoanAction = MakeActionFn<
  MakeRepayPartialLoanActionParams,
  MakeRepayPartialActionResult
>

export const makeRepayPartialLoanAction: MakeRepayPartialLoanAction = async (
  ixnParams,
  walletAndConnection,
) => {
  const { loan, fractionToRepay } = ixnParams
  const { connection, wallet } = walletAndConnection

  const { fraktBond, bondTradeTransaction, nft } = loan

  const { instructions, signers, optimisticResults } = await repayPartialPerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    args: {
      fractionToRepay,
      optimistic: { fraktBond, bondTradeTransaction } as BondAndTransactionOptimistic,
    },
    accounts: {
      lender: new web3.PublicKey(bondTradeTransaction.user),
      oldBondTradeTransactionV2: new web3.PublicKey(bondTradeTransaction.publicKey),
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: new web3.PublicKey(wallet.publicKey || EMPTY_PUBKEY),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const optimisticResult = optimisticResults.map((optimistic) => ({
    publicKey: optimistic.fraktBond.publicKey,
    fraktBond: optimistic.fraktBond,
    bondTradeTransaction: optimistic.bondTradeTransaction,
    nft,
  }))[0]

  return {
    instructions,
    signers,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    additionalResult: optimisticResult,
  }
}
