import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'

import { Offer } from '@banx/api/core'
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
import { useBorrowNftsAndSimpleOffers } from '../../hooks'
import { TableNftData } from './BorrowTable'

export const BorrowCell: FC<{ nft: TableNftData; disabled?: boolean }> = ({
  nft,
  disabled = false,
}) => {
  const borrow = useBorrow()

  const { findBestOffer } = useCartState()
  const { rawOffers } = useBorrowNftsAndSimpleOffers()

  return (
    <Button
      size="small"
      disabled={disabled}
      onClick={(event) => {
        const offer = findBestOffer({ marketPubkey: nft.nft.loan.marketPubkey })
        const rawOffer = rawOffers[nft.nft.loan.marketPubkey].find(
          ({ publicKey }) => publicKey === offer?.publicKey,
        )
        if (offer && rawOffer) {
          borrow({
            mint: nft.mint,
            loanValue: offer.loanValue,
            offer: rawOffer,
          })
        }

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

  const borrow = async ({
    mint,
    offer,
    loanValue,
  }: {
    mint: string
    offer: Offer
    loanValue: number
  }) => {
    await executeLoanTransaction<MakeBorrowPerpetualTransaction>({
      makeTransactionFn: makeBorrowPerpetualTransaction,
      transactionParams: {
        loanValue: loanValue,
        offer,
        mint,
      },
      onSuccess: () => {
        return
      },
    })
  }

  return borrow
}
