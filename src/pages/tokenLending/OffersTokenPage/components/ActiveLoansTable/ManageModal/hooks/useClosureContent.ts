import { useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chain, isEmpty, uniqueId } from 'lodash'
import moment from 'moment'
import { TxnExecutor } from 'solana-transactions-executor'

import { Offer } from '@banx/api/nft'
import { core } from '@banx/api/tokens'
import { useTokenMarketOffers } from '@banx/pages/tokenLending/LendTokenPage'
import { useModal } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  createInstantRefinanceTokenTxnData,
  createTerminateTokenTxnData,
} from '@banx/transactions/tokenLending'
import {
  caclulateBorrowTokenLoanValue,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
  filterOutWalletLoans,
  findSuitableOffer,
  isTokenLoanActive,
  isTokenLoanTerminating,
} from '@banx/utils'

import { useTokenLenderLoans } from '../../hooks'
import { useSelectedTokenLoans } from '../../loansState'

export const useClosureContent = (loan: core.TokenLoan) => {
  const { connection } = useConnection()
  const wallet = useWallet()

  const { close } = useModal()

  const { remove: removeLoan } = useSelectedTokenLoans()

  const { updateOrAddLoan, addMints: hideLoans } = useTokenLenderLoans()

  const marketPubkey = loan.fraktBond.hadoMarket || ''
  const { offers, updateOrAddOffer, isLoading } = useTokenMarketOffers(marketPubkey)

  const bestOffer = useMemo(() => {
    return chain(offers)
      .thru((offers) =>
        filterOutWalletLoans({ offers, walletPubkey: wallet?.publicKey?.toBase58() }),
      )
      .thru((offers) =>
        findSuitableOffer({ loanValue: caclulateBorrowTokenLoanValue(loan).toNumber(), offers }),
      )
      .value()
  }, [loan, offers, wallet?.publicKey])

  const isLoanActive = isTokenLoanActive(loan)
  const hasRefinanceOffer = !isEmpty(bestOffer)

  const canRefinance = hasRefinanceOffer && isLoanActive
  const canTerminate = !isTokenLoanTerminating(loan) && isLoanActive

  const terminateLoan = async () => {
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
                message: 'Offer successfully terminated',
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

  const instantLoan = async () => {
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
              hideLoans([loan.collateral.mint])
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

  const freezeExpiredAt = calculateFreezeExpiredAt(loan)
  const isFreezeExpired = checkIfFreezeExpired(loan)

  return {
    freezeExpiredAt,
    isFreezeExpired,
    canRefinance,
    canTerminate,
    terminateLoan,
    instantLoan,

    isLoading,
  }
}

const calculateFreezeExpiredAt = (loan: core.TokenLoan) => {
  return loan.bondTradeTransaction.soldAt + loan.bondTradeTransaction.terminationFreeze
}

const checkIfFreezeExpired = (loan: core.TokenLoan) => {
  const freezeExpiredAt = calculateFreezeExpiredAt(loan)
  const currentTimeInSeconds = moment().unix()
  return currentTimeInSeconds > freezeExpiredAt
}
