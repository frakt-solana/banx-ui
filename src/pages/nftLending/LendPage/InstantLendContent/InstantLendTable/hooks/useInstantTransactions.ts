import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chain, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import {
  SubscribeNotificationsModal,
  createRefinanceSubscribeNotificationsContent,
  createRefinanceSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { core } from '@banx/api/nft'
import { getDialectAccessToken } from '@banx/providers'
import { useIsLedger, useModal } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import { createLendToBorrowTxnData } from '@banx/transactions/nftLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  isLoanListed,
} from '@banx/utils'

import { useAllLoansRequests } from '../../hooks'
import { calculateLenderApr } from '../helpers'
import { useLoansState } from '../loansState'

export const useInstantTransactions = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { isLedger } = useIsLedger()

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
    } else {
      //? Close warning modal
      close()
    }
  }

  const lendToBorrow = async (loan: core.Loan) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const aprRate = calculateLenderApr(loan)

      const txnData = await createLendToBorrowTxnData({
        loan,
        walletAndConnection,
        aprRate,
      })

      await new TxnExecutor<{ loan: core.Loan; oldLoan: core.Loan }>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
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

          if (confirmed.length) {
            return confirmed.forEach(({ result, signature }) => {
              if (result) {
                const isOldLoanListed = isLoanListed(result.oldLoan)

                const message = isOldLoanListed
                  ? 'Loan successfully funded'
                  : 'Loan successfully refinanced'

                enqueueSnackbar({
                  message,
                  type: 'success',
                  solanaExplorerPath: `tx/${signature}`,
                })

                addMints([loan.nft.mint])
                removeSelection(loan.publicKey)
                onSuccess(1)
              }
            })
          }
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
        transactionName: 'LendToBorrow',
      })
    }
  }

  const lendToBorrowAll = async () => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        selection.map((loan) =>
          createLendToBorrowTxnData({
            loan,
            walletAndConnection,
            aprRate: calculateLenderApr(loan),
          }),
        ),
      )

      await new TxnExecutor<{ loan: core.Loan; oldLoan: core.Loan }>(walletAndConnection, {
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
            enqueueSnackbar({ message: 'Loans successfully funded', type: 'success' })

            const mintsToHidden = chain(confirmed)
              .map(({ result }) => result?.loan.nft.mint)
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
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: selection,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'LendToBorrowAll',
      })
    }
  }

  return {
    lendToBorrow,
    lendToBorrowAll,
  }
}
