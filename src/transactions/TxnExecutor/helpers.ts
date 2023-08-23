import { web3 } from 'fbonds-core'

import { WalletAndConnection } from '@banx/types'

import { EventHanlders, ExecutorOptions, TxnData } from './types'

export const signAndSendTxns = async <TResult>({
  txnsData,
  walletAndConnection,
  eventHandlers,
  options,
}: {
  txnsData: TxnData<TResult>[]
  walletAndConnection: WalletAndConnection
  eventHandlers: EventHanlders
  options: ExecutorOptions
}) => {
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

  if (!wallet.signAllTransactions) return

  eventHandlers?.beforeApproveEveryChunk()

  await wallet.signAllTransactions(txns)

  const results = await Promise.all(
    txns.map(
      async (txn) =>
        await connection.sendRawTransaction(txn.serialize(), {
          skipPreflight: options.skipPreflight,
          preflightCommitment: options.preflightCommitment,
        }),
    ),
  )

  eventHandlers?.pfSuccessEvery(txnsData.map(({ additionalResult }) => additionalResult))

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
    lookupTables.map(
      async (lt) =>
        (await connection.getAddressLookupTable(lt)).value as web3.AddressLookupTableAccount,
    ),
  )

  const txnMessageV0 = new web3.VersionedTransaction(
    new web3.TransactionMessage({
      payerKey: wallet.publicKey as web3.PublicKey,
      recentBlockhash: blockhash,
      instructions: txnData.instructions,
    }).compileToV0Message(lookupTableAccounts),
  )
  if (txnData.signers) {
    txnMessageV0.sign(txnData.signers)
  }

  return txnMessageV0
}
