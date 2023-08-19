import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'

import { BorrowNft, Offer } from '@banx/api/core'
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
import { useBorrowNfts } from '../../hooks'
import { TableNftData } from './BorrowTable'

export const BorrowCell: FC<{ nft: TableNftData; disabled?: boolean }> = ({
  nft,
  disabled = false,
}) => {
  const borrow = useBorrow()

  const { findBestOffer } = useCartState()
  const { rawOffers } = useBorrowNfts()

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
            nft: nft.nft,
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
    nft,
    offer,
    loanValue,
  }: {
    nft: BorrowNft
    offer: Offer
    loanValue: number
  }) => {
    await executeLoanTransaction<MakeBorrowPerpetualTransaction>({
      makeTransactionFn: makeBorrowPerpetualTransaction,
      transactionParams: {
        loanValue,
        offer,
        nft,
      },
      onSuccess: () => {
        return
      },
    })
  }

  return borrow
}
