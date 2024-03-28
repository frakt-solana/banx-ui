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
    new TxnExecutor(makeTerminateAction, { wallet: createWalletInstance(wallet), connection })
      .addTransactionParam({ loan })
      // .on('sentSome', (results) => {
      //   const { result, txnHash } = results[0]
      //   updateOrAddLoan({ ...loan, ...result })
      //   enqueueSnackbar({
      //     message: 'Offer termination successfully initialized',
      //     type: 'success',
      //     solanaExplorerPath: `tx/${signature}`,
      //   })
      // })
      .on('sentSome', (results) => {
        const { signature } = results[0]
        enqueueSnackbar({
          message: 'Transactions sent',
          type: 'info',
          solanaExplorerPath: `tx/${signature}`,
        })
      })
      .on('sentAll', () => {
        close()
      })
      .on('error', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Terminate',
        })
      })
      .execute()
  }

  const claimLoan = () => {
    new TxnExecutor(makeClaimAction, { wallet: createWalletInstance(wallet), connection })
      .addTransactionParam({ loan, priorityFees })
      // .on('sentSome', (results) => {
      //   addMints(loan.nft.mint)
      //   enqueueSnackbar({
      //     message: 'Collateral successfully claimed',
      //     type: 'success',
      //     solanaExplorerPath: `tx/${results[0].txnHash}`,
      //   })
      // })
      .on('sentSome', (results) => {
        enqueueSnackbar({
          message: 'Trasaction sent',
          type: 'info',
          solanaExplorerPath: `tx/${results[0].signature}`,
        })
      })
      .on('error', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Claim',
        })
      })
      .execute()
  }

  const instantLoan = () => {
    new TxnExecutor(makeInstantRefinanceAction, {
      wallet: createWalletInstance(wallet),
      connection,
    })
      .addTransactionParam({ loan, bestOffer, priorityFees })
      // .on('sentSome', (results) => {
      //   const { result, txnHash } = results[0]
      //   result?.bondOffer && updateOrAddOffer(result.bondOffer)
      //   addMints(loan.nft.mint)
      //   enqueueSnackbar({
      //     message: 'Offer successfully sold',
      //     type: 'success',
      //     solanaExplorerPath: `tx/${signature}`,
      //   })
      // })
      .on('sentSome', (results) => {
        const { signature } = results[0]

        enqueueSnackbar({
          message: 'Transaction sent',
          type: 'info',
          solanaExplorerPath: `tx/${signature}`,
        })
      })
      .on('sentAll', () => {
        close()
      })
      .on('error', (error) => {
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
