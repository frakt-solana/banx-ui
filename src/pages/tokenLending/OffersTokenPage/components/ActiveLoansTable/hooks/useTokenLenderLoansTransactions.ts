import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chain, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Offer } from '@banx/api/nft'
import { core } from '@banx/api/tokens'
import { useIsLedger, useModal } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  createClaimTokenTxnData,
  createInstantRefinanceTokenTxnData,
  createRepaymentCallTokenTxnData,
  createTerminateTokenTxnData,
} from '@banx/transactions/tokenLending'
import {
  caclulateBorrowTokenLoanValue,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
} from '@banx/utils'

import { useSelectedTokenLoans } from '../loansState'
import { useTokenLenderLoans } from './useTokenLenderLoans'

export const useTokenLenderLoansTransactions = () => {
  const wallet = useWallet()
  const { isLedger } = useIsLedger()
  const { connection } = useConnection()

  const { addMints: hideLoans, updateOrAddLoan } = useTokenLenderLoans()
  const { clear: clearSelection, remove: removeLoan } = useSelectedTokenLoans()

  const { close } = useModal()

  const terminateTokenLoan = async (loan: core.TokenLoan) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createTerminateTokenTxnData({
        loan,
        walletAndConnection,
      })

      await new TxnExecutor(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
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
            if (result && wallet?.publicKey) {
              enqueueSnackbar({
                message: 'Loan successfully terminated',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              updateOrAddLoan({ ...loan, ...result })
              removeLoan(loan.publicKey, wallet.publicKey.toBase58())
              close()
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
        transactionName: 'Terminate',
      })
    }
  }

  const terminateTokenLoans = async (loans: core.TokenLoan[]) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        loans.map((loan) => createTerminateTokenTxnData({ loan, walletAndConnection })),
      )

      await new TxnExecutor<core.TokenLoan>(walletAndConnection, {
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
            enqueueSnackbar({ message: 'Collaterals successfully terminated', type: 'success' })
            confirmed.forEach(({ result }) => result && updateOrAddLoan(result))
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
        additionalData: loans,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'TerminateTokenLoans',
      })
    }
  }

  const instantTokenLoan = async (
    loan: core.TokenLoan,
    bestOffer: Offer,
    updateOrAddOffer: (offer: Offer) => void,
  ) => {
    if (!bestOffer) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const aprRate = loan.bondTradeTransaction.amountOfBonds

      const txnData = await createInstantRefinanceTokenTxnData({
        loan,
        bestOffer,
        walletAndConnection,
        aprRate,
      })

      await new TxnExecutor<Offer>(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
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
            if (result) {
              enqueueSnackbar({
                message: 'Offer successfully sold',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              updateOrAddOffer(result)
              hideLoans([loan.publicKey])
              close()
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
        additionalData: { bestOffer, loan },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RefinanceInstant',
      })
    }
  }

  const claimTokenLoans = async (loans: core.TokenLoan[]) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        loans.map((loan) => createClaimTokenTxnData({ loan, walletAndConnection })),
      )

      await new TxnExecutor<core.TokenLoan>(walletAndConnection, {
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
            enqueueSnackbar({ message: 'Collaterals successfully claimed', type: 'success' })

            const mintsToHidden = chain(confirmed)
              .map(({ result }) => result?.publicKey)
              .compact()
              .value()

            hideLoans(mintsToHidden)
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
        additionalData: loans,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'ClaimTokenLoans',
      })
    }
  }

  const claimTokenLoan = async (loan: core.TokenLoan) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createClaimTokenTxnData({
        loan,
        walletAndConnection,
      })

      await new TxnExecutor(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
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
            if (result) {
              enqueueSnackbar({
                message: 'Collateral successfully claimed',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              hideLoans([loan.publicKey])
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
        transactionName: 'ClaimTokenLoan',
      })
    }
  }

  const sendRepaymentCall = async (loan: core.TokenLoan, repayPercent: number) => {
    const callAmount = Math.floor(
      (caclulateBorrowTokenLoanValue(loan).toNumber() * repayPercent) / 100,
    )

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createRepaymentCallTokenTxnData({
        loan,
        callAmount,
        walletAndConnection,
      })

      await new TxnExecutor<core.TokenLoan>(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
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
                message: 'Repayment call initialized',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              updateOrAddLoan(result)
              close()
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
        additionalData: { loan, callAmount },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RepaymentCallToken',
      })
    }
  }

  return {
    claimTokenLoan,
    claimTokenLoans,
    instantTokenLoan,
    terminateTokenLoan,
    terminateTokenLoans,
    sendRepaymentCall,
  }
}
