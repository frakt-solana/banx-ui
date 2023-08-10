import { BondFeatures } from 'fbonds-core/lib/fbond-protocol/types'

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

export const useOfferTransactions = ({
  marketPubkey,
  loansAmount,
  loanValue,
  offerPubkey,
}: {
  marketPubkey: string
  loansAmount: number
  loanValue: number
  offerPubkey: string
}) => {
  const { buildAndExecuteTransaction } = useTransactionExecutor()

  const onCreateOffer = async () => {
    await buildAndExecuteTransaction<CreateOfferTransactionParams>({
      makeTransactionFn: makeCreatePerpetualOfferTransaction,
      transactionParams: {
        marketPubkey,
        bondFeature: BondFeatures.AutoCompoundAndReceiveNft,
        amountOfSolToDeposit: loansAmount * loanValue,
        loanValueFilter: loanValue,
      },
    })
  }

  const onRemoveOffer = async () => {
    await buildAndExecuteTransaction<RemoveOfferTransactionParams>({
      makeTransactionFn: makeRemovePerpetualOfferTransaction,
      transactionParams: { offerPubkey },
    })
  }

  const onUpdateOffer = async () => {
    await buildAndExecuteTransaction<UpdateOfferTransactionParams>({
      makeTransactionFn: makeUpdatePerpetualOfferTransaction,
      transactionParams: { loanValue, loansAmount, offerPubkey },
    })
  }

  return { onCreateOffer, onRemoveOffer, onUpdateOffer }
}
