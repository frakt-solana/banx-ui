import { useMemo, useState } from 'react'

import { filter, get, groupBy, includes, isEmpty, sortBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { useCartState } from '../../cartState'
import { useBorrowNfts } from '../../hooks'
import { getTableColumns } from './columns'
import { DEFAULT_TABLE_SORT } from './constants'
import { SortField, TableNftData } from './types'

import styles from './BorrowTable.module.less'

export const useBorrowTable = () => {
  const { nfts, isLoading } = useBorrowNfts()
  const { offerByMint, addNft, removeNft, findOfferInCart, findBestOffer } = useCartState()

  const tableNftData: TableNftData[] = nfts.map((nft) => {
    const offer = findOfferInCart({ mint: nft.mint })

    const loanValue = (() => {
      if (offer) return offer.loanValue
      const bestOffer = findBestOffer({ marketPubkey: nft.loan.marketPubkey })
      return bestOffer?.loanValue ?? 0
    })()

    const selected = !!offer

    return { mint: nft.mint, nft, loanValue, selected }
  })

  const onSelectAll = () => {
    return
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

  const searchSelectOptions = Object.values(
    groupBy(tableNftData, ({ nft }) => nft.nft.meta.collectionName),
  ).map((nfts) => {
    const firstNftFromCollection = nfts.at(0)?.nft.nft.meta ?? null
    return {
      collectionName: firstNftFromCollection?.collectionName ?? '',
      collectionImage: firstNftFromCollection?.collectionImage ?? '',
      nftsCount: nfts.length,
    }
  })

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
          secondLabel: { key: 'nftsCount' },
        },
        className: styles.searchSelect,
        selectedOptions,
        labels: ['Collections', 'Nfts'],
        onChange: setSelectedOptions,
      },
      sortParams: { option: sortOption, onChange: setSortOption },
    },
  }
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
