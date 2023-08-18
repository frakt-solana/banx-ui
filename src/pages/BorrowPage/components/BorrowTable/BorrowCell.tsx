import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'

import {
  MakeTransactionFn,
  TransactionParams,
  buildAndExecuteTransaction,
} from '@banx/transactions'
import {
  MakeBorrowPerpetualTransaction,
  makeBorrowPerpetualTransaction,
} from '@banx/transactions/borrow'

import { useCartState } from '../../cartState'
import { SimpleOffer } from '../../types'
import { TableNftData } from './BorrowTable'

export const BorrowCell: FC<{ nft: TableNftData; disabled?: boolean }> = ({
  nft,
  disabled = false,
}) => {
  const borrow = useBorrow()

  const { findBestOffer } = useCartState()

  return (
    <Button
      size="small"
      disabled={disabled}
      onClick={(event) => {
        const offer = findBestOffer({ marketPubkey: nft.nft.loan.marketPubkey })
        offer &&
          borrow({
            mint: nft.mint,
            offer,
          })

        event.stopPropagation()
      }}
    >
      Borrow
    </Button>
  )
}

const useBorrow = () => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const executeLoanTransaction = async <T extends object>(props: {
    makeTransactionFn: MakeTransactionFn<TransactionParams<T>>
    transactionParams: TransactionParams<T>
    onSuccess: () => void
  }) => {
    await buildAndExecuteTransaction({
      wallet,
      connection,
      ...props,
    })
  }

  const borrow = async ({ mint, offer }: { mint: string; offer: SimpleOffer }) => {
    await executeLoanTransaction<MakeBorrowPerpetualTransaction>({
      makeTransactionFn: makeBorrowPerpetualTransaction,
      transactionParams: {
        loanValue: offer.loanValue,
        offerPubkey: offer.publicKey,
        marketPubkey: offer.hadoMarket,
        mint,
      },
      onSuccess: () => {
        return
      },
    })
  }

  return borrow
}
