import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import { Loan, Offer } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import {
  makeClaimAction,
  makeInstantRefinanceAction,
  makeTerminateAction,
} from '@banx/transactions/loans'

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
        updateOrAddLoan({ ...loan, ...results[0].result })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  const claimLoan = () => {
    new TxnExecutor(makeClaimAction, { wallet, connection })
      .addTxnParam({ loan })
      .on('pfSuccessAll', () => {
        addMints(loan.nft.mint)
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
        const bondOffer = results?.[0]?.result?.bondOffer
        bondOffer && updateOrAddOffer(bondOffer)
        addMints(loan.nft.mint)
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  return { terminateLoan, claimLoan, instantLoan }
}
