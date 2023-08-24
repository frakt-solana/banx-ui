import { useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chunk, filter, first, get, groupBy, includes, isEmpty, map, sortBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { BorrowNft, Offer } from '@banx/api/core'
import { enqueueTxnErrorSnackbar } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { LOANS_PER_TXN, MakeBorrowActionParams, makeBorrowAction } from '@banx/transactions/borrow'
import { captureSentryTxnError } from '@banx/utils'

import { useCartState } from '../../cartState'
import { useBorrowNfts } from '../../hooks'
import { SimpleOffer } from '../../types'
import { getTableColumns } from './columns'
import { DEFAULT_TABLE_SORT } from './constants'
import { SortField, TableNftData } from './types'

import styles from './BorrowTable.module.less'

export const useBorrowTable = () => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const { nfts, isLoading, rawOffers } = useBorrowNfts()
  const { offerByMint, addNft, removeNft, findOfferInCart, findBestOffer, addNftsAuto, resetCart } =
    useCartState()

  const tableNftData: TableNftData[] = nfts.map((nft) => {
    const offer = findOfferInCart({ mint: nft.mint })

    const loanValue =
      offer?.loanValue || findBestOffer({ marketPubkey: nft.loan.marketPubkey })?.loanValue || 0

    const selected = !!offer

    return { mint: nft.mint, nft, loanValue, selected }
  })

  const borrow = (nft: TableNftData) => {
    const { marketPubkey } = nft.nft.loan

    const offer = findBestOffer({ marketPubkey })
    const rawOffer = rawOffers[marketPubkey].find(({ publicKey }) => publicKey === offer?.publicKey)

    if (!offer || !rawOffer) return

    new TxnExecutor(
      makeBorrowAction,
      { wallet, connection },
      { signAllChunks: 40, rejectQueueOnFirstPfError: false },
    )
      .addTxnParam([
        {
          loanValue: nft.loanValue,
          nft: nft.nft,
          offer: rawOffer,
        },
      ])
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

  const borrowAll = () => {
    const txnParams = createBorrowParams(offerByMint, nfts, rawOffers)

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

  const onSelectAll = () => {
    if (isEmpty(offerByMint)) {
      addNftsAuto(nfts)
    } else {
      resetCart()
    }
  }

  const onNftSelect = (nft: TableNftData) => {
    const isInCart = !!findOfferInCart({ mint: nft.mint })

    if (isInCart) {
      return removeNft({ mint: nft.mint })
    }

    const bestOffer = findBestOffer({ marketPubkey: nft.nft.loan.marketPubkey })
    if (bestOffer) {
      addNft({ mint: nft.mint, offer: bestOffer })
    }
  }

  const columns = getTableColumns({
    onSelectAll,
    onNftSelect,
    isCartEmpty: isEmpty(offerByMint),
  })

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_TABLE_SORT)

  const filteredNfts = useFilteredNfts(tableNftData, selectedOptions)
  const sortedNfts = useSortedNfts(filteredNfts, sortOption.value)

  const searchSelectOptions = useMemo(() => {
    const nftsGroupedByCollection = groupBy(nfts, (nft) => nft.nft.meta.collectionName)
    return map(nftsGroupedByCollection, (groupedNfts) => {
      const firstNftInGroup = first(groupedNfts)
      const { collectionName = '', collectionImage = '' } = firstNftInGroup?.nft.meta || {}
      const numberOfNFTs = groupedNfts.length

      return {
        collectionName,
        collectionImage,
        numberOfNFTs,
      }
    })
  }, [nfts])

  return {
    tableNftData: sortedNfts,
    columns,
    onRowClick: onNftSelect,
    isLoading,
    sortViewParams: {
      searchSelectParams: {
        options: searchSelectOptions,
        optionKeys: {
          labelKey: 'collectionName',
          valueKey: 'collectionName',
          imageKey: 'collectionImage',
          secondLabel: { key: 'numberOfNFTs' },
        },
        className: styles.searchSelect,
        selectedOptions,
        labels: ['Collections', 'Nfts'],
        onChange: setSelectedOptions,
      },
      sortParams: { option: sortOption, onChange: setSortOption },
    },
    borrow,
    borrowAll,
  }
}

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

const useFilteredNfts = (nfts: TableNftData[], selectedOptions: string[]) => {
  const filteredLoans = useMemo(() => {
    if (selectedOptions.length) {
      return filter(nfts, ({ nft }) => includes(selectedOptions, nft.nft.meta.collectionName))
    }
    return nfts
  }, [nfts, selectedOptions])

  return filteredLoans
}

const useSortedNfts = (nfts: TableNftData[], sortOptionValue: string) => {
  const sortedLoans = useMemo(() => {
    if (!sortOptionValue) {
      return nfts
    }

    const [name, order] = sortOptionValue.split('_')

    const sortValueMapping: Record<SortField, string> = {
      [SortField.BORROW]: 'nft.loanValue',
      [SortField.NAME]: 'nft.nft.nft.meta.name',
    }

    const sorted = sortBy(nfts, (nft) => {
      const sortValue = sortValueMapping[name as SortField]
      return get(nft, sortValue)
    })

    return order === 'desc' ? sorted.reverse() : sorted
  }, [sortOptionValue, nfts])

  return sortedLoans
}
