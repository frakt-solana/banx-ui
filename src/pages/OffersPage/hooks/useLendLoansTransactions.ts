import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { TxnExecutor } from 'solana-transactions-executor'

import { Loan, Offer } from '@banx/api/core'
import { useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import {
  makeClaimAction,
  makeInstantRefinanceAction,
  makeTerminateAction,
} from '@banx/transactions/loans'
import { enqueueSnackbar, usePriorityFees } from '@banx/utils'

export const useLendLoansTransactions = ({
  loan,
  bestOffer,
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
    new TxnExecutor(makeTerminateAction, { wallet, connection })
      .addTxnParam({ loan })
      // .on('pfSuccessEach', (results) => {
      //   const { result, txnHash } = results[0]
      //   updateOrAddLoan({ ...loan, ...result })
      //   enqueueSnackbar({
      //     message: 'Offer termination successfully initialized',
      //     type: 'success',
      //     solanaExplorerPath: `tx/${txnHash}`,
      //   })
      // })
      .on('pfSuccessEach', (results) => {
        const { txnHash } = results[0]
        enqueueSnackbar({
          message: 'Transactions sent',
          type: 'info',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfSuccessAll', () => {
        close()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Terminate',
        })
      })
      .execute()
  }

  const claimLoan = () => {
    new TxnExecutor(makeClaimAction, { wallet, connection })
      .addTxnParam({ loan, priorityFees })
      // .on('pfSuccessEach', (results) => {
      //   addMints(loan.nft.mint)
      //   enqueueSnackbar({
      //     message: 'Collateral successfully claimed',
      //     type: 'success',
      //     solanaExplorerPath: `tx/${results[0].txnHash}`,
      //   })
      // })
      .on('pfSuccessEach', (results) => {
        enqueueSnackbar({
          message: 'Trasaction sent',
          type: 'info',
          solanaExplorerPath: `tx/${results[0].txnHash}`,
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Claim',
        })
      })
      .execute()
  }

  const instantLoan = () => {
    new TxnExecutor(makeInstantRefinanceAction, { wallet, connection })
      .addTxnParam({ loan, bestOffer, priorityFees })
      // .on('pfSuccessEach', (results) => {
      //   const { result, txnHash } = results[0]
      //   result?.bondOffer && updateOrAddOffer(result.bondOffer)
      //   addMints(loan.nft.mint)
      //   enqueueSnackbar({
      //     message: 'Offer successfully sold',
      //     type: 'success',
      //     solanaExplorerPath: `tx/${txnHash}`,
      //   })
      // })
      .on('pfSuccessEach', (results) => {
        const { txnHash } = results[0]

        enqueueSnackbar({
          message: 'Transaction sent',
          type: 'info',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfSuccessAll', () => {
        close()
      })
      .on('pfError', (error) => {
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
