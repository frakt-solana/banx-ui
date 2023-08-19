import { useMemo, useState } from 'react'

import { filter, get, groupBy, includes, isEmpty, sortBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'
import Table from '@banx/components/Table'

import { BorrowNft } from '@banx/api/core'

import { useCartState } from '../../cartState'
import { useBorrowNfts } from '../../hooks'
import { getTableColumns } from './columns'

import styles from './BorrowTable.module.less'

export interface TableNftData {
  mint: string
  nft: BorrowNft
  loanValue: number
  selected: boolean
  // fee: number
  // apr: number
}

const BorrowTable = () => {
  const { nfts } = useBorrowNfts()
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

  //TODO
  // const onSelectAll = (): void => {
  //   if (hasSelectedLoans) {
  //     clearSelection()
  //   } else {
  //     setSelection(data as Loan[])
  //   }
  // }

  const columns = getTableColumns({
    onSelectAll,
    onNftSelect,
    isCartEmpty: isEmpty(offerByMint),
  })

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const [sortOption, setSortOption] = useState<SortOption>({
    label: 'Borrow',
    value: 'borrow_desc',
  })

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

  return (
    <Table
      data={sortedNfts}
      columns={columns}
      onRowClick={onNftSelect}
      sortViewParams={{
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
      }}
      // sortViewParams={sortViewParams}
      // breakpoints={breakpoints}
      // className={className}
      rowKeyField="mint"
      // loading={loading}
      showCard
      activeRowParams={{
        field: 'fraktBond.terminatedCounter',
        value: true,
        className: styles.termitated,
      }}
    />
  )
}

export type SearchSelectOption = {
  collectionName: string
  collectionImage: string
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

enum SortField {
  BORROW = 'Borrow',
  NAME = 'Name',
}

const useSortedNfts = (nfts: TableNftData[], sortOptionValue: string) => {
  const sortedLoans = useMemo(() => {
    if (!sortOptionValue) {
      return nfts
    }

    const [name, order] = sortOptionValue.split('_')

    const sortValueMapping: Record<SortField, string> = {
      [SortField.BORROW]: 'mint',
      [SortField.NAME]: 'mint',
    }

    const sorted = sortBy(nfts, (loan) => {
      const sortValue = sortValueMapping[name as SortField]
      return get(loan, sortValue)
    })

    return order === 'desc' ? sorted.reverse() : sorted
  }, [sortOptionValue, nfts])

  return sortedLoans
}

export default BorrowTable
