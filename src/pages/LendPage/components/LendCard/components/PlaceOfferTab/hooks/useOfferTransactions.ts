import { BondFeatures } from 'fbonds-core/lib/fbond-protocol/types'

import { Offer } from '@banx/api/bonds'
import { useOptimisticOfferStore } from '@banx/pages/LendPage/hooks'
import { TransactionParams, useTransactionExecutor } from '@banx/transactions'
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
  const { toggleOptimisticOffer, removOptimisticOffer } = useOptimisticOfferStore()

  const { buildAndExecuteTransaction } = useTransactionExecutor()

  const onCreateOffer = async () => {
    const result = await buildAndExecuteTransaction<
      CreateOfferTransactionParams,
      CreateOfferTransactionReturnType
    >({
      makeTransactionFn: makeCreatePerpetualOfferTransaction,
      transactionParams: {
        marketPubkey,
        bondFeature: BondFeatures.AutoCompoundAndReceiveNft,
        loansAmount,
        loanValue,
      },
    })

    if (result?.optimisticResult) {
      toggleOptimisticOffer(result?.optimisticResult.bondOffer)
    }
  }

  const onRemoveOffer = async () => {
    const optimisticOffer = offers.find((offer) => offer.publicKey === offerPubkey)

    const result = await buildAndExecuteTransaction<
      RemoveOfferTransactionParams,
      RemoveOfferTransactionReturnType
    >({
      makeTransactionFn: makeRemovePerpetualOfferTransaction,
      transactionParams: { offerPubkey, optimisticOffer },
    })

    if (result?.optimisticResult) {
      removOptimisticOffer(result?.optimisticResult.bondOffer.publicKey)
    }
  }

  const onUpdateOffer = async () => {
    const optimisticOffer = offers.find((offer) => offer.publicKey === offerPubkey)

    const result = await buildAndExecuteTransaction<
      UpdateOfferTransactionParams,
      UpdateOfferTransactionReturnType
    >({
      makeTransactionFn: makeUpdatePerpetualOfferTransaction,
      transactionParams: {
        loanValue,
        offerPubkey,
        optimisticOffer,
        loansAmount,
      },
    })

    if (result?.optimisticResult) {
      toggleOptimisticOffer(result?.optimisticResult.bondOffer)
    }
  }

  return { onCreateOffer, onRemoveOffer, onUpdateOffer }
}
