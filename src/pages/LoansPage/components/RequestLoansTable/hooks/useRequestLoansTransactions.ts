import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { useIsLedger } from '@banx/store/common'
import { useLoansRequestsOptimistic } from '@banx/store/nft'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import { createDelistTxnData } from '@banx/transactions/nftLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
} from '@banx/utils'

import { useSelectedLoans } from '../loansState'

export const useRequestLoansTransactions = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { isLedger } = useIsLedger()

  const { update: updateLoansOptimistic } = useLoansRequestsOptimistic()
  const { selection, clear: clearSelection } = useSelectedLoans()

  const delist = async (loan: core.Loan) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createDelistTxnData({ loan, walletAndConnection })

      await new TxnExecutor<core.Loan>(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
        .addTxnData(txnData)
        .on('sentSome', (results) => {
          results.forEach(({ signature }) => enqueueTransactionSent(signature))
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }

          return confirmed.forEach(({ result, signature }) => {
            if (result && wallet.publicKey) {
              enqueueSnackbar({
                message: 'Delisted successfully',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              updateLoansOptimistic([result], wallet.publicKey.toBase58())
              clearSelection()
            }
          })
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: loan,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'Delist',
      })
    }
  }

  const delistAll = async () => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        selection.map(({ loan }) => createDelistTxnData({ loan, walletAndConnection })),
      )

      await new TxnExecutor<core.Loan>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
        chunkSize: isLedger ? 5 : 40,
      })
        .addTxnsData(txnsData)
        .on('sentAll', () => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Loans delisted successfully', type: 'success' })

            confirmed.forEach(({ result }) => {
              if (result && wallet.publicKey) {
                updateLoansOptimistic([result], wallet.publicKey.toBase58())
              }
            })

            clearSelection()
          }

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: selection,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'DelistBulk',
      })
    }
  }

  return {
    delist,
    delistAll,
  }
}
