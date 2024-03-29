import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { TxnExecutor } from 'solana-transactions-executor'

import { Loan, Offer } from '@banx/api/core'
import { useModal } from '@banx/store'
import { createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import {
  makeClaimAction,
  makeInstantRefinanceAction,
  makeTerminateAction,
} from '@banx/transactions/loans'
import {
  createSnackbarState,
  destroySnackbar,
  enqueueSnackbar,
  enqueueTranactionError,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
  usePriorityFees,
} from '@banx/utils'

export const useLendLoansTransactions = ({
  loan,
  bestOffer,
  updateOrAddLoan,
  updateOrAddOffer,
  addMints,
}: {
  loan: Loan
  bestOffer: Offer
  updateOrAddLoan: (loan: Loan) => void
  updateOrAddOffer: (offer: Offer) => void
  addMints: (...mints: string[]) => void
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { close } = useModal()

  const priorityFees = usePriorityFees()

  const terminateLoan = () => {
    const loadingSnackbarState = createSnackbarState()

    new TxnExecutor(makeTerminateAction, { wallet: createWalletInstance(wallet), connection })
      .addTransactionParam({ loan })
      .on('sentSome', (results) => {
        results.forEach(({ signature }) => enqueueTransactionSent(signature))
        loadingSnackbarState.id = enqueueWaitingConfirmation()
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results

        if (failed.length) {
          destroySnackbar(loadingSnackbarState.id)
          return enqueueTranactionError()
        }

        confirmed.forEach(({ result, signature }) => {
          if (result) {
            destroySnackbar(loadingSnackbarState.id)
            enqueueSnackbar({
              message: 'Offer termination successfully initialized',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            updateOrAddLoan({ ...loan, ...result })
          }
        })
        close()
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarState.id)
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Terminate',
        })
      })
      .execute()
  }

  const claimLoan = () => {
    const loadingSnackbarState = createSnackbarState()

    new TxnExecutor(makeClaimAction, { wallet: createWalletInstance(wallet), connection })
      .addTransactionParam({ loan, priorityFees })

      .on('sentSome', (results) => {
        results.forEach(({ signature }) => enqueueTransactionSent(signature))
        loadingSnackbarState.id = enqueueWaitingConfirmation()
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results

        if (failed.length) {
          destroySnackbar(loadingSnackbarState.id)
          return enqueueTranactionError()
        }

        return confirmed.forEach(({ result, signature }) => {
          if (result) {
            destroySnackbar(loadingSnackbarState.id)
            enqueueSnackbar({
              message: 'Collateral successfully claimed',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            addMints(loan.nft.mint)
          }
        })
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarState.id)
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Claim',
        })
      })
      .execute()
  }

  const instantLoan = () => {
    const loadingSnackbarState = createSnackbarState()

    new TxnExecutor(makeInstantRefinanceAction, {
      wallet: createWalletInstance(wallet),
      connection,
    })
      .addTransactionParam({ loan, bestOffer, priorityFees })
      .on('sentSome', (results) => {
        results.forEach(({ signature }) => enqueueTransactionSent(signature))
        loadingSnackbarState.id = enqueueWaitingConfirmation()
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results

        if (failed.length) {
          destroySnackbar(loadingSnackbarState.id)
          return enqueueTranactionError()
        }

        confirmed.forEach(({ result, signature }) => {
          if (result) {
            destroySnackbar(loadingSnackbarState.id)
            enqueueSnackbar({
              message: 'Offer successfully sold',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            updateOrAddOffer(result.bondOffer)
            addMints(loan.nft.mint)
          }
        })
        close()
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarState.id)
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'RefinanceInstant',
        })
      })
      .execute()
  }

  return { terminateLoan, claimLoan, instantLoan }
}
