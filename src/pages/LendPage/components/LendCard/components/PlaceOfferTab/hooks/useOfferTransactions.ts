import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BondFeatures, BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'

import { Offer } from '@banx/api/bonds'
import { useOptimisticOfferStore } from '@banx/pages/LendPage/hooks'
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
}: {
  marketPubkey: string
  loansAmount: number
  loanValue: number
  offerPubkey: string
  offers: Offer[]
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const { updateOrAddOptimisticOffer, removeOptimisticOffer } = useOptimisticOfferStore()

  const optimisticOffer = offers.find((offer) => offer.publicKey === offerPubkey)

  const executeOfferTransaction = async <T extends object>(
    makeTransactionFn: MakeTransactionFn<TransactionParams<T>>,
    transactionParams: TransactionParams<T>,
    optimisticAction: (offer: Offer) => void,
  ) => {
    const result = await buildAndExecuteTransaction<
      TransactionParams<T>,
      ReturnType<MakeTransactionFn<TransactionParams<T>>>
    >({
      makeTransactionFn,
      transactionParams,
      wallet,
      connection,
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
        bondFeature: BondFeatures.AutoCompoundAndReceiveNft,
        loansAmount,
        loanValue,
      },
      updateOrAddOptimisticOffer,
    )
  }

  const onRemoveOffer = async () => {
    await executeOfferTransaction<MakeRemovePerpetualOfferTransaction>(
      makeRemovePerpetualOfferTransaction,
      { offerPubkey, optimisticOffer },
      removeOptimisticOffer,
    )
  }

  const onUpdateOffer = async () => {
    await executeOfferTransaction<MakeUpdatePerpetualOfferTransaction>(
      makeUpdatePerpetualOfferTransaction,
      {
        loanValue,
        offerPubkey,
        optimisticOffer,
        loansAmount,
      },
      updateOrAddOptimisticOffer,
    )
  }

  return { onCreateOffer, onRemoveOffer, onUpdateOffer }
}
