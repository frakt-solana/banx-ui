import { useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'

import { Offer } from '@banx/api/bonds'
import {
  MakeTransactionFn,
  TransactionParams,
  buildAndExecuteTransaction,
} from '@banx/transactions'
import {
  MakeCreatePerpetualOfferTransaction,
  MakeRemovePerpetualOfferTransaction,
  MakeUpdatePerpetualOfferTransaction,
  makeCreatePerpetualOfferTransaction,
  makeRemovePerpetualOfferTransaction,
  makeUpdatePerpetualOfferTransaction,
} from '@banx/transactions/bonds'

type OptimisticResult = {
  optimisticResult: { bondOffer: BondOfferV2 }
}

const hasOptimisticResult = (result: unknown): result is OptimisticResult =>
  result !== null && typeof result === 'object' && 'optimisticResult' in result

export const useOfferTransactions = ({
  marketPubkey,
  loansAmount,
  loanValue,
  offerPubkey,
  offers,
  updateOrAddOffer,
  resetFormValues,
  goToPlaceOffer,
}: {
  marketPubkey: string
  loansAmount: number
  loanValue: number
  offerPubkey: string
  offers: Offer[]
  updateOrAddOffer: (offer: Offer) => void
  resetFormValues: () => void
  goToPlaceOffer: () => void
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const optimisticOffer = useMemo(() => {
    return offers.find((offer) => offer.publicKey === offerPubkey)
  }, [offers, offerPubkey])

  const executeOfferTransaction = async <T extends object>(
    makeTransactionFn: MakeTransactionFn<TransactionParams<T>>,
    transactionParams: TransactionParams<T>,
    optimisticAction: (offer: Offer) => void,
    onSuccess?: () => void,
  ) => {
    const result = await buildAndExecuteTransaction<
      TransactionParams<T>,
      ReturnType<MakeTransactionFn<TransactionParams<T>>>
    >({
      makeTransactionFn,
      transactionParams,
      wallet,
      connection,
      onSuccess,
    })

    if (hasOptimisticResult(result)) {
      optimisticAction(result.optimisticResult.bondOffer)
    }
  }

  const onCreateOffer = async () => {
    await executeOfferTransaction<MakeCreatePerpetualOfferTransaction>(
      makeCreatePerpetualOfferTransaction,
      {
        marketPubkey,
        loansAmount,
        loanValue,
      },
      updateOrAddOffer,
      resetFormValues,
    )
  }

  const onRemoveOffer = async () => {
    if (!optimisticOffer) return

    await executeOfferTransaction<MakeRemovePerpetualOfferTransaction>(
      makeRemovePerpetualOfferTransaction,
      { offerPubkey, optimisticOffer },
      updateOrAddOffer,
      goToPlaceOffer,
    )
  }

  const onUpdateOffer = async () => {
    if (!optimisticOffer) return

    await executeOfferTransaction<MakeUpdatePerpetualOfferTransaction>(
      makeUpdatePerpetualOfferTransaction,
      {
        loanValue,
        offerPubkey,
        optimisticOffer,
        loansAmount,
      },
      updateOrAddOffer,
    )
  }

  return { onCreateOffer, onRemoveOffer, onUpdateOffer }
}
