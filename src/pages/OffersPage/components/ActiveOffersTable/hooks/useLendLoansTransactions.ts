import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import { Loan, Offer } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import {
  InstantRefinanceOptimisticResult,
  makeClaimAction,
  makeInstantRefinanceAction,
  makeTerminateAction,
} from '@banx/transactions/loans'

export const useLendLoansTransactions = ({
  loan,
  bestOffer,
  updateOrAddOffer,
  addMints,
}: {
  loan: Loan
  bestOffer: Offer
  updateOrAddOffer: (offers: Offer) => void
  addMints: (...mints: string[]) => void
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const terminateLoan = () => {
    new TxnExecutor(makeTerminateAction, { wallet, connection })
      .addTxnParam({ loan })
      .on('pfSuccessEvery', (additionalResult: InstantRefinanceOptimisticResult[]) => {
        updateOrAddOffer(additionalResult[0].bondOffer)
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  const claimLoan = () => {
    new TxnExecutor(makeClaimAction, { wallet, connection })
      .addTxnParam({ loan })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  const instantLoan = () => {
    new TxnExecutor(makeInstantRefinanceAction, { wallet, connection })
      .addTxnParam({ loan, bestOffer })
      .on('pfSuccessEvery', (additionalResult: InstantRefinanceOptimisticResult[]) => {
        updateOrAddOffer(additionalResult[0].bondOffer)
        addMints(loan.nft.mint)
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  return { terminateLoan, claimLoan, instantLoan }
}
