import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import {
  BondAndTransactionOptimistic,
  terminatePerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type makeTerminateLoanTransaction = (params: {
  connection: web3.Connection
  wallet: WalletContextState
  loan: Loan
}) => Promise<{
  transaction: web3.Transaction
  signers: web3.Signer[]
}>

export const makeTerminateLoanTransaction: makeTerminateLoanTransaction = async ({
  connection,
  wallet,
  loan,
}) => {
  const { bondTradeTransaction, fraktBond } = loan || {}

  const { instructions, signers } = await terminatePerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      bondTradeTransactionV2: new web3.PublicKey(bondTradeTransaction.publicKey),
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: wallet.publicKey as web3.PublicKey,
    },
    optimistic: {
      fraktBond,
      bondTradeTransaction,
    } as BondAndTransactionOptimistic,
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    transaction: new web3.Transaction().add(...instructions),
    signers,
  }
}
