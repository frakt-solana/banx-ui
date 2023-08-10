import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BondFeatures, BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'
import { has } from 'lodash'

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

const hasOptimisticResult = <R>(
  result: unknown,
): result is { optimisticResult: { bondOffer: R } } =>
  typeof result === 'object' && result !== null && has(result, 'optimisticResult')

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

  const { toggleOptimisticOffer, removeOptimisticOffer } = useOptimisticOfferStore()

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
      optimisticAction(result.optimisticResult.bondOffer as BondOfferV2)
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
      toggleOptimisticOffer,
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
      toggleOptimisticOffer,
    )
  }

  return { onCreateOffer, onRemoveOffer, onUpdateOffer }
}
