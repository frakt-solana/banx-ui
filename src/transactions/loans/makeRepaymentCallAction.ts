import { web3 } from 'fbonds-core'
import { setRepaymentCall } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'
import { CreateTransactionDataFn } from 'solana-transactions-executor'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeRepaymentCallParams = {
  loan: Loan
  callAmount: number //? SOL lamports
}

export type MakeRepaymentCallAction = CreateTransactionDataFn<MakeRepaymentCallParams, Loan>

export const makeRepaymentCallAction: MakeRepaymentCallAction = async (
  { loan, callAmount },
  { connection, wallet },
) => {
  const { bondTradeTransaction, fraktBond } = loan

  const {
    instructions,
    signers,
    optimistic: optimisticResult,
  } = await setRepaymentCall({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),

    args: {
      callAmount,
    },
    optimistic: {
      bondTradeTransaction,
    },
    accounts: {
      bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      fraktBond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: wallet.publicKey,
    },

    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const optimisticLoan = {
    ...loan,
    fraktBond: {
      ...loan.fraktBond,
      lastTransactedAt: moment().unix(), //? Needs to prevent BE data overlap in optimistics logic
    },
    bondTradeTransaction: optimisticResult.bondTradeTransaction,
  }

  return {
    instructions,
    signers,
    result: optimisticLoan,
    lookupTables: [],
  }
}
