import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chain, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import {
  SubscribeNotificationsModal,
  createRefinanceSubscribeNotificationsContent,
  createRefinanceSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { Loan } from '@banx/api/core'
import { TXN_EXECUTOR_CONFIRM_OPTIONS } from '@banx/constants'
import { useModal, usePriorityFees } from '@banx/store'
import { createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import { makeLendToBorrowAction } from '@banx/transactions/loans'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  getDialectAccessToken,
} from '@banx/utils'

import { useAllLoansRequests } from '../../hooks'
import { useLoansState } from '../loansState'

export const useInstantTransactions = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { priorityLevel } = usePriorityFees()

  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()
  const { addMints } = useAllLoansRequests()
  const { open, close } = useModal()

  const { selection, clear: clearSelection, remove: removeSelection } = useLoansState()

  const onSuccess = (loansAmount: number) => {
    if (!getDialectAccessToken(wallet.publicKey?.toBase58())) {
      open(SubscribeNotificationsModal, {
        title: createRefinanceSubscribeNotificationsTitle(loansAmount),
        message: createRefinanceSubscribeNotificationsContent(),
        onActionClick: () => {
          close()
          setBanxNotificationsSiderVisibility(true)
        },
        onCancel: close,
      })
    }
  }

  const refinance = (loan: Loan) => {
    const loadingSnackbarId = uniqueId()

    new TxnExecutor(
      makeLendToBorrowAction,
      { wallet: createWalletInstance(wallet), connection },
      { confirmOptions: TXN_EXECUTOR_CONFIRM_OPTIONS },
    )
      .addTransactionParam({ loan, priorityFeeLevel: priorityLevel })
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
          if (result) {
            enqueueSnackbar({
              message: 'Loan successfully refinanced',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            addMints([loan.nft.mint])
            removeSelection(loan.publicKey)
            onSuccess(1)
          }
        })
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarId)
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Refinance',
        })
      })
      .execute()
  }

  const refinanceAll = () => {
    const loadingSnackbarId = uniqueId()

    const txnParams = selection.map((loan) => ({ loan, priorityFeeLevel: priorityLevel }))

    new TxnExecutor(
      makeLendToBorrowAction,
      { wallet: createWalletInstance(wallet), connection },
      { confirmOptions: TXN_EXECUTOR_CONFIRM_OPTIONS },
    )
      .addTransactionParams(txnParams)
      .on('sentAll', () => {
        enqueueTransactionsSent()
        enqueueWaitingConfirmation(loadingSnackbarId)
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results

        destroySnackbar(loadingSnackbarId)

        if (confirmed.length) {
          enqueueSnackbar({ message: 'Loans successfully refinanced', type: 'success' })

          const mintsToHidden = chain(confirmed)
            .map(({ result }) => result?.nft.mint)
            .compact()
            .value()

          addMints(mintsToHidden)
          clearSelection()
          onSuccess(mintsToHidden.length)
        }

        if (failed.length) {
          return failed.forEach(({ signature, reason }) =>
            enqueueConfirmationError(signature, reason),
          )
        }
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarId)
        defaultTxnErrorHandler(error, {
          additionalData: txnParams,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Refinance',
        })
      })
      .execute()
  }

  return {
    refinance,
    refinanceAll,
  }
}
