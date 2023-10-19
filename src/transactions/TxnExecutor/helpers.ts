import { web3 } from 'fbonds-core'

import { WalletAndConnection } from '@banx/types'

import { TxnError } from '../types'
import { USER_REJECTED_TXN_ERR_MESSAGES } from './constants'
import { EventHanlders, ExecutorOptions, SendTxnsResult, TxnData } from './types'

export const signAndSendTxns = async <TResult>({
  txnsData,
  walletAndConnection,
  eventHandlers,
  options,
}: {
  txnsData: TxnData<TResult>[]
  walletAndConnection: WalletAndConnection
  eventHandlers: EventHanlders<TResult>
  options: ExecutorOptions
}): Promise<SendTxnsResult<TResult>> => {
  const { connection, wallet } = walletAndConnection

  const { blockhash } = await connection.getLatestBlockhash()

  const txns = (
    await Promise.all(
      txnsData.map((txnData) =>
        createTxn({
          txnData,
          blockhash,
          walletAndConnection,
        }),
      ),
    )
  ).filter(Boolean) as web3.VersionedTransaction[]

  if (!wallet.signAllTransactions) {
    throw new Error("Wallet is not connected. Or doesn't support signAllTransactions method")
  }

  eventHandlers?.beforeApproveEveryChunk?.()

  const signedTxns = await wallet.signAllTransactions(txns)

  const txnHashes = await Promise.all(
    signedTxns.map(
      async (txn) =>
        await connection.sendRawTransaction(txn.serialize(), {
          skipPreflight: options.skipPreflight,
          preflightCommitment: options.preflightCommitment,
        }),
    ),
  )

  const results = txnHashes.map((txnHash, idx) => ({
    txnHash,
    result: txnsData?.[idx]?.additionalResult,
  }))

  eventHandlers?.pfSuccessEach?.(results)

  return results
}

export const createTxn = async <TResult>({
  txnData,
  blockhash,
  walletAndConnection,
}: {
  txnData: TxnData<TResult>
  blockhash: string
  walletAndConnection: WalletAndConnection
}) => {
  const { connection, wallet } = walletAndConnection

  const { lookupTables } = txnData

  const lookupTableAccounts = await Promise.all(
    lookupTables.map((lt) => fetchLookupTableAccount(lt, connection)),
  )

  const txnMessageV0 = new web3.VersionedTransaction(
    new web3.TransactionMessage({
      payerKey: wallet.publicKey as web3.PublicKey,
      recentBlockhash: blockhash,
      instructions: txnData.instructions,
    }).compileToV0Message(
      lookupTableAccounts.map(({ value }) => value as web3.AddressLookupTableAccount),
    ),
  )
  if (txnData.signers) {
    txnMessageV0.sign(txnData.signers)
  }

  return txnMessageV0
}

const lookupTablesCache = new Map<
  string,
  Promise<web3.RpcResponseAndContext<web3.AddressLookupTableAccount | null>>
>()
const fetchLookupTableAccount = (lookupTable: web3.PublicKey, connection: web3.Connection) => {
  const lookupTableAddressStr = lookupTable.toBase58()

  if (!lookupTablesCache.has(lookupTableAddressStr)) {
    const lookupTableAccountPromise = connection.getAddressLookupTable(lookupTable)

    lookupTablesCache.set(lookupTableAddressStr, lookupTableAccountPromise)
  }

  return lookupTablesCache.get(lookupTableAddressStr)!
}

export const hasUserRejectedTxnApprove = (error: TxnError) => {
  const { message } = error
  if (USER_REJECTED_TXN_ERR_MESSAGES.includes(message)) {
    return true
  }
  return false
}
