import { useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import { Offer } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
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
  offerPubkey,
  offers,
  updateOrAddOffer,
  resetFormValues,
  exitEditMode,
}: {
  marketPubkey: string
  loansAmount: number
  loanValue: number
  deltaValue: number
  offerPubkey: string
  offers: Offer[]
  updateOrAddOffer: (offer: Offer) => void
  resetFormValues: () => void
  exitEditMode: () => void
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const optimisticOffer = useMemo(() => {
    return offers.find((offer) => offer.publicKey === offerPubkey)
  }, [offers, offerPubkey])

  const onCreateOffer = async () => {
    const txnParam = { marketPubkey, loansAmount, loanValue, deltaValue }

    await new TxnExecutor(makeCreateBondingOfferAction, { wallet, connection })
      .addTxnParam(txnParam)
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        result?.bondOffer && updateOrAddOffer(result.bondOffer)
        resetFormValues()
        enqueueSnackbar({
          message: 'Offer successfully placed',
          type: 'success',
          solanaExplorerPath: `tx/${txnHash}`,
        })
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

    const txnParam = { loanValue, offerPubkey, optimisticOffer, loansAmount, deltaValue }

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

    const txnParam = { offerPubkey, optimisticOffer }

    new TxnExecutor(makeRemoveOfferAction, { wallet, connection })
      .addTxnParam(txnParam)
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
          additionalData: txnParam,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'RemoveOffer',
        })
      })
      .execute()
  }

  return { onCreateOffer, onRemoveOffer, onUpdateOffer }
}
