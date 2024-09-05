import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chain, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import {
  SubscribeNotificationsModal,
  createRefinanceSubscribeNotificationsContent,
  createRefinanceSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { core } from '@banx/api/tokens'
import { getDialectAccessToken } from '@banx/providers'
import { useIsLedger, useModal } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateLendToBorrowTokenTxnDataParams,
  createLendToBorrowTokenTxnData,
} from '@banx/transactions/tokenLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  isTokenLoanListed,
} from '@banx/utils'

import { useLoansTokenState } from '../loansState'
import { useAllTokenLoansRequests } from './useAllTokenLoansRequests'

export const useInstantTokenTransactions = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { isLedger } = useIsLedger()
  const { tokenType } = useNftTokenType()

  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()
  const { addLoansPubkeys } = useAllTokenLoansRequests()
  const { open, close } = useModal()

  const { selection, clear: clearSelection, remove: removeSelection } = useLoansTokenState()

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

  const lendToBorrow = async (loan: core.TokenLoan) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const aprRate = loan.bondTradeTransaction.amountOfBonds

      const txnData = await createLendToBorrowTokenTxnData(
        { loan, aprRate, tokenType },
        walletAndConnection,
      )

      await new TxnExecutor<CreateLendToBorrowTokenTxnDataParams>(
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
            return confirmed.forEach(({ params, signature }) => {
              const isOldLoanListed = isTokenLoanListed(params.loan)

              const message = isOldLoanListed
                ? 'Loan successfully funded'
                : 'Loan successfully refinanced'

              enqueueSnackbar({
                message,
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              addLoansPubkeys([loan.publicKey])
              removeSelection(loan.publicKey)
              onSuccess(1)
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
        transactionName: 'LendToBorrowToken',
      })
    }
  }

  const lendToBorrowAll = async () => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        selection.map((loan) =>
          createLendToBorrowTokenTxnData(
            { loan, aprRate: loan.bondTradeTransaction.amountOfBonds, tokenType },
            walletAndConnection,
          ),
        ),
      )

      await new TxnExecutor<CreateLendToBorrowTokenTxnDataParams>(walletAndConnection, {
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

            const pubkeysToHidden = chain(confirmed)
              .map(({ params }) => params.loan.publicKey)
              .compact()
              .value()

            addLoansPubkeys(pubkeysToHidden)
            clearSelection()
            onSuccess(pubkeysToHidden.length)
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
        transactionName: 'LendToBorrowAllToken',
      })
    }
  }

  return {
    lendToBorrow,
    lendToBorrowAll,
  }
}
