import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import { Loan, Offer } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import {
  makeClaimAction,
  makeInstantRefinanceAction,
  makeTerminateAction,
} from '@banx/transactions/loans'
import { enqueueSnackbar } from '@banx/utils'

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

  const terminateLoan = () => {
    new TxnExecutor(makeTerminateAction, { wallet, connection })
      .addTxnParam({ loan })
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        updateOrAddLoan({ ...loan, ...result })
        enqueueSnackbar({
          message: 'Transaction Executed',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  const claimLoan = () => {
    new TxnExecutor(makeClaimAction, { wallet, connection })
      .addTxnParam({ loan })
      .on('pfSuccessEach', (results) => {
        addMints(loan.nft.mint)
        enqueueSnackbar({
          message: 'Transaction Executed',
          solanaExplorerPath: `tx/${results[0].txnHash}`,
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  const instantLoan = () => {
    new TxnExecutor(makeInstantRefinanceAction, { wallet, connection })
      .addTxnParam({ loan, bestOffer })
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        result?.bondOffer && updateOrAddOffer(result.bondOffer)
        addMints(loan.nft.mint)
        enqueueSnackbar({
          message: 'Transaction Executed',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  return { terminateLoan, claimLoan, instantLoan }
}
