import React, { FC } from 'react'

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
import { TableNftData } from './types'

export const BorrowCell: FC<{ nft: TableNftData; disabled?: boolean }> = ({
  nft,
  disabled = false,
}) => {
  const borrow = useBorrowTxn()

  const { findBestOffer } = useCartState()
  const { rawOffers } = useBorrowNfts()

  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
  }

  return (
    <Button size="small" disabled={disabled} onClick={onClickHandler}>
      Borrow
    </Button>
  )
}

const useBorrowTxn = () => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const executeBorrowTransaction = async <T extends object>(props: {
    makeTransactionFn: MakeTransactionFn<TransactionParams<T>>
    transactionParams: TransactionParams<T>
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
    await executeBorrowTransaction<MakeBorrowPerpetualTransaction>({
      makeTransactionFn: makeBorrowPerpetualTransaction,
      transactionParams: {
        loanValue,
        offer,
        nft,
      },
    })
  }

  return borrow
}
