import { web3 } from 'fbonds-core'
import { setRepaymentCall } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { RepaymentCall } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'
import { MakeActionFn } from 'solana-transactions-executor'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeRepaymentCallParams = {
  loan: Loan
  callAmount: number //? SOL lamports
}

export type MakeRepaymentCallAction = MakeActionFn<MakeRepaymentCallParams, Loan>

export const makeRepaymentCallAction: MakeRepaymentCallAction = async (
  { loan, callAmount },
  { connection, wallet },
) => {
  const { bondTradeTransaction, fraktBond, repaymentCall } = loan

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
      repaymentCall: repaymentCall as RepaymentCall,
    },
    accounts: {
      bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      fraktBond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: wallet.publicKey as web3.PublicKey,
    },

    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const optimisticLoan: Loan = {
    ...loan,
    fraktBond: {
      ...loan.fraktBond,
      lastTransactedAt: moment().unix(), //? Needs to prevent BE data overlap in optimistics logic
    },
    repaymentCall: optimisticResult.repaymentCall,
  }

  return {
    instructions,
    signers,
    additionalResult: optimisticLoan,
    lookupTables: [],
  }
}
