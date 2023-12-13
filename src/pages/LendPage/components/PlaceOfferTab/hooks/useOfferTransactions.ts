import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { TxnExecutor } from 'solana-transactions-executor'

import { Offer } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import {
  makeCreateBondingOfferAction,
  makeRemoveOfferAction,
  makeUpdateBondingOfferAction,
} from '@banx/transactions/bonds'
import { enqueueSnackbar } from '@banx/utils'

export const useOfferTransactions = ({
  marketPubkey,
  loansAmount,
  loanValue,
  deltaValue,
  optimisticOffer,
  updateOrAddOffer,
  resetFormValues,
  exitEditMode,
}: {
  marketPubkey: string
  loansAmount: number
  loanValue: number
  deltaValue: number
  optimisticOffer?: Offer
  updateOrAddOffer: (offer: Offer) => void
  resetFormValues: () => void
  exitEditMode: () => void
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const onCreateOffer = async () => {
    const txnParam = { marketPubkey, loansAmount, loanValue, deltaValue }

    await new TxnExecutor(makeCreateBondingOfferAction, { wallet, connection })
      .addTxnParam(txnParam)
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        result?.bondOffer && updateOrAddOffer(result.bondOffer)

        enqueueSnackbar({
          message: 'Offer successfully placed',
          type: 'success',
          solanaExplorerPath: `tx/${txnHash}`,
        })
        resetFormValues()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParam,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'CreateBondingOffer',
        })
      })
      .execute()
  }

  const onUpdateOffer = async () => {
    if (!optimisticOffer) return

    const txnParam = { loanValue, optimisticOffer, loansAmount, deltaValue }

    await new TxnExecutor(makeUpdateBondingOfferAction, { wallet, connection })
      .addTxnParam(txnParam)
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        result?.bondOffer && updateOrAddOffer(result.bondOffer)

        enqueueSnackbar({
          message: 'Changes successfully applied',
          type: 'success',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParam,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'UpdateBondingOffer',
        })
      })
      .execute()
  }

  const onRemoveOffer = () => {
    if (!optimisticOffer) return

    new TxnExecutor(makeRemoveOfferAction, { wallet, connection })
      .addTxnParam({ optimisticOffer })
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        result?.bondOffer && updateOrAddOffer(result.bondOffer)

        enqueueSnackbar({
          message: 'Offer successfully removed',
          type: 'success',
          solanaExplorerPath: `tx/${txnHash}`,
        })
        exitEditMode()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: optimisticOffer,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'RemoveOffer',
        })
      })
      .execute()
  }

  return {
    onCreateOffer,
    onUpdateOffer,
    onRemoveOffer,
  }
}
