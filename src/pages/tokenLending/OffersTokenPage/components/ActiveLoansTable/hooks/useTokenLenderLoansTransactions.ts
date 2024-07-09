import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chain, uniqueId } from 'lodash'
import moment from 'moment'
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
  parseInstantRefinanceSimulatedAccounts,
  parseRepaymentCallSimulatedAccounts,
  parseTerminateSimulatedAccounts,
} from '@banx/transactions/nftLending'
import {
  CreateClaimTokenTxnDataParams,
  CreateInstantRefinanceTokenTxnDataParams,
  CreateRepaymentCallTokenTxnDataParams,
  CreateTerminateTokenTxnDataParams,
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

  const { addLoansPubkeys, updateOrAddLoan } = useTokenLenderLoans()
  const { clear: clearSelection, remove: removeLoan } = useSelectedTokenLoans()

  const { close } = useModal()

  const terminateTokenLoan = async (loan: core.TokenLoan) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createTerminateTokenTxnData({ loan }, walletAndConnection)

      await new TxnExecutor<CreateTerminateTokenTxnDataParams>(
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

          return confirmed.forEach(({ accountInfoByPubkey, params, signature }) => {
            if (accountInfoByPubkey && wallet?.publicKey) {
              enqueueSnackbar({
                message: 'Loan successfully terminated',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              const { loan } = params
              const { bondTradeTransaction, fraktBond } =
                parseTerminateSimulatedAccounts(accountInfoByPubkey)

              updateOrAddLoan({ ...loan, fraktBond, bondTradeTransaction })
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
        loans.map((loan) => createTerminateTokenTxnData({ loan }, walletAndConnection)),
      )

      await new TxnExecutor<CreateTerminateTokenTxnDataParams>(walletAndConnection, {
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
            confirmed.forEach(({ accountInfoByPubkey, params }) => {
              if (!accountInfoByPubkey) return

              const { loan } = params
              const { bondTradeTransaction, fraktBond } =
                parseTerminateSimulatedAccounts(accountInfoByPubkey)

              updateOrAddLoan({ ...loan, fraktBond, bondTradeTransaction })
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

      const txnData = await createInstantRefinanceTokenTxnData(
        { loan, bestOffer, aprRate },
        walletAndConnection,
      )

      await new TxnExecutor<CreateInstantRefinanceTokenTxnDataParams>(
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

          return confirmed.forEach(({ accountInfoByPubkey, signature }) => {
            if (accountInfoByPubkey) {
              enqueueSnackbar({
                message: 'Offer successfully sold',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              const offer = parseInstantRefinanceSimulatedAccounts(accountInfoByPubkey)

              updateOrAddOffer(offer)
              addLoansPubkeys([loan.publicKey])
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
        loans.map((loan) => createClaimTokenTxnData({ loan }, walletAndConnection)),
      )

      await new TxnExecutor<CreateClaimTokenTxnDataParams>(walletAndConnection, {
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
              .map(({ params }) => params.loan.publicKey)
              .compact()
              .value()

            addLoansPubkeys(mintsToHidden)
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

      const txnData = await createClaimTokenTxnData({ loan }, walletAndConnection)

      await new TxnExecutor<CreateClaimTokenTxnDataParams>(
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

          return confirmed.forEach(({ params, signature }) => {
            enqueueSnackbar({
              message: 'Collateral successfully claimed',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            addLoansPubkeys([params.loan.publicKey])
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

      const txnData = await createRepaymentCallTokenTxnData(
        { loan, callAmount },
        walletAndConnection,
      )

      await new TxnExecutor<CreateRepaymentCallTokenTxnDataParams>(
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

          return confirmed.forEach(({ accountInfoByPubkey, params, signature }) => {
            if (accountInfoByPubkey) {
              enqueueSnackbar({
                message: 'Repayment call initialized',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              const { loan } = params
              const bondTradeTransaction = parseRepaymentCallSimulatedAccounts(accountInfoByPubkey)

              const optimisticLoan = {
                ...loan,
                fraktBond: {
                  ...loan.fraktBond,
                  lastTransactedAt: moment().unix(), //? Needs to prevent BE data overlap in optimistics logic
                },
                bondTradeTransaction,
              }

              updateOrAddLoan(optimisticLoan)
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
