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

type CreateOfferTransactionParams = TransactionParams<MakeCreatePerpetualOfferTransaction>
type RemoveOfferTransactionParams = TransactionParams<MakeRemovePerpetualOfferTransaction>
type UpdateOfferTransactionParams = TransactionParams<MakeUpdatePerpetualOfferTransaction>

type CreateOfferTransactionReturnType = ReturnType<MakeCreatePerpetualOfferTransaction>
type RemoveOfferTransactionReturnType = ReturnType<MakeRemovePerpetualOfferTransaction>
type UpdateOfferTransactionReturnType = ReturnType<MakeUpdatePerpetualOfferTransaction>

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

  const executeOfferTransaction = async <T, R>(
    makeTransactionFn: MakeTransactionFn<T>,
    transactionParams: T,
    optimisticAction: (offer: Offer) => void,
  ) => {
    const result = await buildAndExecuteTransaction<T, R>({
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
    await executeOfferTransaction<CreateOfferTransactionParams, CreateOfferTransactionReturnType>(
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
    await executeOfferTransaction<RemoveOfferTransactionParams, RemoveOfferTransactionReturnType>(
      makeRemovePerpetualOfferTransaction,
      { offerPubkey, optimisticOffer },
      removeOptimisticOffer,
    )
  }

  const onUpdateOffer = async () => {
    await executeOfferTransaction<UpdateOfferTransactionParams, UpdateOfferTransactionReturnType>(
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
