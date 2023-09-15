import { useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import { Offer } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import {
  makeCreateOfferAction,
  makeRemoveOfferAction,
  makeUpdateOfferAction,
} from '@banx/transactions/bonds'
import { enqueueSnackbar } from '@banx/utils'

export const useOfferTransactions = ({
  marketPubkey,
  loansAmount,
  loanValue,
  offerPubkey,
  offers,
  updateOrAddOffer,
  resetFormValues,
  exitEditMode,
}: {
  marketPubkey: string
  loansAmount: number
  loanValue: number
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
    await new TxnExecutor(makeCreateOfferAction, { wallet, connection })
      .addTxnParam({ marketPubkey, loansAmount, loanValue })
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        result?.bondOffer && updateOrAddOffer(result.bondOffer)
        resetFormValues()
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

  const onRemoveOffer = () => {
    if (!optimisticOffer) return

    new TxnExecutor(makeRemoveOfferAction, { wallet, connection })
      .addTxnParam({ offerPubkey, optimisticOffer })
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        result?.bondOffer && updateOrAddOffer(result.bondOffer)
        enqueueSnackbar({
          message: 'Transaction Executed',
          solanaExplorerPath: `tx/${txnHash}`,
        })
        exitEditMode()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  const onUpdateOffer = async () => {
    if (!optimisticOffer) return

    await new TxnExecutor(makeUpdateOfferAction, { wallet, connection })
      .addTxnParam({ loanValue, offerPubkey, optimisticOffer, loansAmount })
      .on('pfSuccessEach', (results) => {
        const { result, txnHash } = results[0]
        result?.bondOffer && updateOrAddOffer(result.bondOffer)
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

  return { onCreateOffer, onRemoveOffer, onUpdateOffer }
}
