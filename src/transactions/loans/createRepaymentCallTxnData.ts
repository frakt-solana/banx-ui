import { web3 } from 'fbonds-core'
import { setRepaymentCall } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '../helpers'

type CreateRepaymentCallTxnData = (params: {
  loan: core.Loan
  callAmount: number
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<core.Loan>>

export const createRepaymentCallTxnData: CreateRepaymentCallTxnData = async ({
  loan,
  callAmount,
  walletAndConnection,
}) => {
  const { wallet, connection } = walletAndConnection
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
