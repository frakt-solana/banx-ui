import { useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { core } from '@banx/api/tokens'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import { createRepaymentCallTokenTxnData } from '@banx/transactions/tokenLending'
import {
  calculateLentTokenValueWithInterest,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
} from '@banx/utils'

import { useTokenLenderLoans } from '../../hooks'

export const useRepaymentCallContent = (loan: core.TokenLoan) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { updateOrAddLoan } = useTokenLenderLoans()

  const { repaymentCallActive, totalClaim, initialRepayPercent, initialRepayValue } =
    calculateRepaymentStaticValues(loan)

  const [repayPercent, setRepayPercent] = useState<number>(initialRepayPercent)
  const [paybackValue, setPaybackValue] = useState<number>(initialRepayValue)

  const onPartialPercentChange = (percentValue: number) => {
    setRepayPercent(percentValue)
    setPaybackValue(Math.floor((totalClaim * percentValue) / 100))
  }

  const remainingDebt = totalClaim - paybackValue

  const ltv = (remainingDebt / loan.collateralPrice) * 100

  const sendBtnDisabled =
    !repayPercent || (repaymentCallActive && initialRepayValue === paybackValue)

  const onSend = async () => {
    const callAmount = Math.floor((0 * repayPercent) / 100)

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
    repayPercent,
    onPartialPercentChange,
    remainingDebt,
    ltv,
    sendBtnDisabled,
    onSend,
    repaymentCallActive,
    paybackValue,
  }
}

export const calculateRepaymentStaticValues = (loan: core.TokenLoan) => {
  const DEFAULT_REPAY_PERCENT = 50

  const repaymentCallActive = false

  const repaymentCallLenderReceives = 0

  const totalClaim = calculateLentTokenValueWithInterest(loan).toNumber()

  const initialRepayPercent = repaymentCallActive
    ? (repaymentCallLenderReceives / totalClaim) * 100
    : DEFAULT_REPAY_PERCENT

  const initialRepayValue = repaymentCallActive
    ? repaymentCallLenderReceives
    : totalClaim * (initialRepayPercent / 100)

  return {
    repaymentCallActive,
    totalClaim,
    initialRepayPercent,
    initialRepayValue,
  }
}
