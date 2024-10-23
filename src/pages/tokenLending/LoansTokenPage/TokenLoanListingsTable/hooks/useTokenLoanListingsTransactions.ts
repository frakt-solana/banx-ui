import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import { uniqueId } from 'lodash'
import moment from 'moment'
import { TxnExecutor } from 'solana-transactions-executor'

import { TokenLoan } from '@banx/api/tokens'
import { useTokenLoanListingsOptimistic } from '@banx/store/token'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateDelistTokenTxnDataParams,
  createDelistTokenTxnData,
} from '@banx/transactions/tokenLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
} from '@banx/utils'

import { useSelectTokenLoans } from '../loansState'

export const useTokenLoanListingsTransactions = () => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const { update: updateLoansOptimistic } = useTokenLoanListingsOptimistic()
  const { selection, clear: clearSelection } = useSelectTokenLoans()

  const delist = async (loan: TokenLoan) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createDelistTokenTxnData({ loan }, walletAndConnection)

      await new TxnExecutor<CreateDelistTokenTxnDataParams>(
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
              message: 'Delisted successfully',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            const optimisticLoan = createOptimisticLoan(params.loan)
            updateLoansOptimistic([optimisticLoan], wallet.publicKey!.toBase58())
            clearSelection()
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
        transactionName: 'DelistToken',
      })
    }
  }

  const delistAll = async () => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        selection.map(({ loan }) => createDelistTokenTxnData({ loan }, walletAndConnection)),
      )

      await new TxnExecutor<CreateDelistTokenTxnDataParams>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
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

            confirmed.forEach(({ params }) => {
              const optimisticLoan = createOptimisticLoan(params.loan)
              updateLoansOptimistic([optimisticLoan], wallet.publicKey!.toBase58())
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
        transactionName: 'DelistAllTokens',
      })
    }
  }

  return { delist, delistAll }
}

const createOptimisticLoan = (loan: TokenLoan): TokenLoan => {
  const currentTimeInSeconds = moment().unix()

  const optimisticLoan = {
    ...loan,
    bondTradeTransaction: {
      ...loan.bondTradeTransaction,
      //? Set not active state to filter out loan from list
      bondTradeTransactionState: BondTradeTransactionV2State.NotActive,
    },
    fraktBond: {
      ...loan.fraktBond,
      //? Needs to prevent BE data overlap in optimistics logic
      lastTransactedAt: currentTimeInSeconds,
    },
  }

  return optimisticLoan
}
