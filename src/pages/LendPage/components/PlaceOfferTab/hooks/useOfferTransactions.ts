import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { TxnExecutor } from 'solana-transactions-executor'

import { Offer } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import {
  makeCreateBondingOfferAction,
  makeCreateOfferAction,
  makeRemoveOfferAction,
  makeUpdateBondingOfferAction,
  makeUpdateOfferAction,
} from '@banx/transactions/bonds'
import { enqueueSnackbar } from '@banx/utils'

export const useOfferTransactions = ({
  marketPubkey,
  loansAmount,
  loanValue,
  deltaValue = 0,
  offerPubkey,
  optimisticOffer,
  updateOrAddOffer,
  resetFormValues,
  exitEditMode,
}: {
  marketPubkey: string
  loansAmount: number
  loanValue: number
  deltaValue?: number
  offerPubkey: string
  optimisticOffer?: Offer
  updateOrAddOffer: (offer: Offer) => void
  resetFormValues: () => void
  exitEditMode: () => void
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const onCreateBondingOffer = async () => {
    const txnParam = { marketPubkey, loansAmount, loanValue, deltaValue }

    await new TxnExecutor(makeCreateBondingOfferAction, { wallet, connection })
      .addTxnParam(txnParam)
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        result?.bondOffer && updateOrAddOffer(result.bondOffer)

        showSuccessSnackbar({ message: 'Offer successfully placed', txnHash })
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

  const onUpdateBondingOffer = async () => {
    if (!optimisticOffer) return

    const txnParam = { loanValue, offerPubkey, optimisticOffer, loansAmount, deltaValue }

    await new TxnExecutor(makeUpdateBondingOfferAction, { wallet, connection })
      .addTxnParam(txnParam)
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        result?.bondOffer && updateOrAddOffer(result.bondOffer)

        showSuccessSnackbar({ message: 'Changes successfully applied', txnHash })
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

  const onCreateOffer = async () => {
    const txnParam = { marketPubkey, loansAmount, loanValue }

    await new TxnExecutor(makeCreateOfferAction, { wallet, connection })
      .addTxnParam(txnParam)
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        result?.bondOffer && updateOrAddOffer(result.bondOffer)
        resetFormValues()

        showSuccessSnackbar({ message: 'Offer successfully placed', txnHash })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParam,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'CreateOffer',
        })
      })
      .execute()
  }

  const onUpdateOffer = async () => {
    if (!optimisticOffer) return

    const txnParam = { loanValue, offerPubkey, optimisticOffer, loansAmount }

    await new TxnExecutor(makeUpdateOfferAction, { wallet, connection })
      .addTxnParam(txnParam)
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        result?.bondOffer && updateOrAddOffer(result.bondOffer)
        showSuccessSnackbar({ message: 'Changes successfully applied', txnHash })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParam,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'UpdateOffer',
        })
      })
      .execute()
  }

  const onRemoveOffer = () => {
    if (!optimisticOffer) return

    const txnParam = { offerPubkey, optimisticOffer }

    new TxnExecutor(makeRemoveOfferAction, { wallet, connection })
      .addTxnParam(txnParam)
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        result?.bondOffer && updateOrAddOffer(result.bondOffer)

        showSuccessSnackbar({ message: 'Offer successfully removed', txnHash })
        exitEditMode()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParam,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'RemoveOffer',
        })
      })
      .execute()
  }

  return { onCreateBondingOffer, onUpdateBondingOffer, onRemoveOffer, onCreateOffer, onUpdateOffer }
}

const showSuccessSnackbar = ({ message, txnHash }: { message: string; txnHash: string }) => {
  enqueueSnackbar({
    message,
    type: 'success',
    solanaExplorerPath: `tx/${txnHash}`,
  })
}
