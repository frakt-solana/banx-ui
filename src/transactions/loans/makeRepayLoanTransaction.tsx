import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import {
  BondAndTransactionOptimistic,
  repayPerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

export type MakeRepayLoanTransaction = (params: {
  connection: web3.Connection
  wallet: WalletContextState
  loan: Loan
}) => Promise<{
  transaction: web3.Transaction
  signers: web3.Signer[]
}>

export const makeRepayLoanTransaction: MakeRepayLoanTransaction = async ({
  connection,
  wallet,
  loan,
}) => {
  const { bondTradeTransaction, fraktBond } = loan || {}

  const { instructions, signers } = await repayPerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: wallet.publicKey as web3.PublicKey,
    },
    args: {
      repayAccounts: [
        {
          bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
          lender: new web3.PublicKey(bondTradeTransaction.user),
          fbond: new web3.PublicKey(fraktBond.publicKey),
          collateralTokenMint: new web3.PublicKey(fraktBond.fbondTokenMint),
          optimistic: {
            fraktBond,
            bondTradeTransaction,
          } as BondAndTransactionOptimistic,
        },
      ],
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    transaction: new web3.Transaction().add(...instructions),
    signers,
  }
}
