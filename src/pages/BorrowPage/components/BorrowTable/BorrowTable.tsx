import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chunk } from 'lodash'

import { Button } from '@banx/components/Buttons'
import Table from '@banx/components/Table'

import { BorrowNft, Offer } from '@banx/api/core'
import { enqueueTxnErrorSnackbar } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { LOANS_PER_TXN, MakeBorrowActionParams, makeBorrowAction } from '@banx/transactions/borrow'
import { captureSentryTxnError } from '@banx/utils'

import { useCartState } from '../../cartState'
import { useBorrowNfts } from '../../hooks'
import { SimpleOffer } from '../../types'
import { useBorrowTable } from './hooks'

const BorrowTable = () => {
  const { tableNftData, columns, onRowClick, sortViewParams, isLoading } = useBorrowTable()

  const { offerByMint } = useCartState()
  const { nfts, rawOffers } = useBorrowNfts()

  const wallet = useWallet()
  const { connection } = useConnection()

  const txnParams = createBorrowParams(offerByMint, nfts, rawOffers)

  const onBorrowAll = () => {
    new TxnExecutor(
      makeBorrowAction,
      { wallet, connection },
      { signAllChunks: 40, rejectQueueOnFirstPfError: false },
    )
      .addTxnParams(txnParams)
      // eslint-disable-next-line no-console
      .on('pfSuccessEvery', (result) => console.log(result))
      .on('pfError', (error) => {
        if (error instanceof Error && 'logs' in error && Array.isArray(error.logs)) {
          console.error(error)
          console.error(error.logs.join('\n'))
        }
        captureSentryTxnError({ error })
        enqueueTxnErrorSnackbar(error)
      })
      .execute()
  }

  return (
    <>
      <Button onClick={onBorrowAll}>Borrow bulk</Button>

      <Table
        data={tableNftData}
        columns={columns}
        onRowClick={onRowClick}
        sortViewParams={sortViewParams}
        // sortViewParams={sortViewParams}
        // breakpoints={breakpoints}
        // className={className}
        rowKeyField="mint"
        loading={isLoading}
        showCard
      />
    </>
  )
}

export default BorrowTable

const createBorrowParams = (
  offerByMint: Record<string, SimpleOffer>,
  nfts: BorrowNft[],
  rawOffers: Record<string, Offer[]>,
) => {
  const borrowIxnParams = Object.entries(offerByMint)
    .map(([mint, sOffer]) => {
      const nft = nfts.find(({ nft }) => nft.mint === mint)
      const marketPubkey = nft?.loan.marketPubkey || ''
      const offer = rawOffers[marketPubkey].find(({ publicKey }) => publicKey === sOffer?.publicKey)

      if (!nft || !offer) return null

      return {
        nft: nft as BorrowNft,
        loanValue: sOffer.loanValue,
        offer: offer as Offer,
      }
    })
    .filter(Boolean) as MakeBorrowActionParams

  return chunk(borrowIxnParams, LOANS_PER_TXN)
}
