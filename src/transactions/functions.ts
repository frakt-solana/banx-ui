import { WalletContextState } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'
import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY } from 'fbonds-core/lib/fbond-protocol/constants'

import { BorrowNft, Loan } from '@banx/api/core'
import { captureSentryTxnError } from '@banx/utils'

import { enqueueTxnErrorSnackbar, signAndConfirmTransaction } from './helpers'
import { TxnError } from './types'

export type MakeTransactionFn<T> = (
  params: T & { connection: Connection; wallet: WalletContextState },
) => Promise<{ transaction: web3.Transaction; signers: web3.Signer[] }>

export type TransactionOptions<T> = {
  makeTransactionFn: MakeTransactionFn<T>
  transactionParams: T
  commitment?: web3.Commitment
  connection: Connection
  wallet: WalletContextState
  onSuccess?: () => void
}

export const buildAndExecuteTransaction = async <T, R>({
  makeTransactionFn,
  transactionParams,
  commitment = 'confirmed',
  wallet,
  connection,
  onSuccess,
}: TransactionOptions<T>): Promise<R | undefined> => {
  if (!wallet.publicKey) {
    return undefined
  }

  try {
    const { transaction, signers, ...rest } = await makeTransactionFn({
      ...transactionParams,
      connection,
      wallet,
    })

    await signAndConfirmTransaction({
      transaction,
      signers,
      commitment,
      wallet,
      connection,
    })

    onSuccess?.()

    return { transaction, signers, ...rest } as R
  } catch (error) {
    if (error instanceof Error && 'logs' in error && Array.isArray(error.logs)) {
      console.error(error)
      console.error(error.logs.join('\n'))
    }

    captureSentryTxnError({ error })
    enqueueTxnErrorSnackbar(error as TxnError)
  }
}

export const convertLoanToBorrowNft = (loan: Loan): BorrowNft => {
  const { nft, fraktBond, bondTradeTransaction } = loan

  const borrowNft = {
    mint: nft.mint,
    loan: {
      marketPubkey: fraktBond.hadoMarket || EMPTY_PUBKEY.toBase58(),
      fraktMarket: fraktBond.fraktMarket,
      marketApr: bondTradeTransaction.amountOfBonds,
      banxStake: fraktBond.banxStake || EMPTY_PUBKEY.toBase58(),
    },
    nft,
  }

  return borrowNft
}
