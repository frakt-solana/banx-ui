import { BondFeatures } from 'fbonds-core/lib/fbond-protocol/types'

import { TransactionParams, useTransactionExecutor } from '@banx/transactions'
import {
  MakeCreatePerpetualOfferTransaction,
  MakeRemovePerpetualOfferTransaction,
  makeCreatePerpetualOfferTransaction,
  makeRemovePerpetualOfferTransaction,
} from '@banx/transactions/bonds'

type CreateOfferTransactionParams = TransactionParams<MakeCreatePerpetualOfferTransaction>
type RemoveOfferTransactionParams = TransactionParams<MakeRemovePerpetualOfferTransaction>

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

  return { onCreateOffer, onRemoveOffer }
}
