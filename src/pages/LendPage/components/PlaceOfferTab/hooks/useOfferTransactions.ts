import { useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'

import { Offer } from '@banx/api/core'
import {
  MakeTransactionFn,
  TransactionParams,
  buildAndExecuteTransaction,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import {
  MakeCreatePerpetualOfferTransaction,
  MakeUpdatePerpetualOfferTransaction,
  makeCreatePerpetualOfferTransaction,
  makeRemoveOfferAction,
  makeUpdatePerpetualOfferTransaction,
} from '@banx/transactions/bonds'
import { enqueueSnackbar } from '@banx/utils'

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
        goToPlaceOffer()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
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
