import { useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { filter, first, get, groupBy, includes, isEmpty, map, sortBy } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { SortOption } from '@banx/components/SortDropdown'

import { BorrowNft, Offer } from '@banx/api/core'
import { PATHS } from '@banx/router'
import {
  ViewState,
  useIsLedger,
  useLoansOptimistic,
  useOffersOptimistic,
  useTableView,
} from '@banx/store'

import { useCartState } from '../../cartState'
import { getTableColumns } from './columns'
import { DEFAULT_TABLE_SORT, SORT_OPTIONS } from './constants'
import { createBorrowAllParams, createTableNftData, executeBorrow } from './helpers'
import { SortField, TableNftData } from './types'

import styles from './BorrowTable.module.less'

export interface UseBorrowTableProps {
  nfts: BorrowNft[]
  rawOffers: Record<string, Offer[]>
}

export const useBorrowTable = ({ nfts, rawOffers }: UseBorrowTableProps) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const navigate = useNavigate()
  const { isLedger } = useIsLedger()

  const { offerByMint, addNft, removeNft, findOfferInCart, findBestOffer, addNftsAuto, resetCart } =
    useCartState()
  const { add: addLoansOptimistic } = useLoansOptimistic()
  const { update: updateOffersOptimistic } = useOffersOptimistic()

  const tableNftsData: TableNftData[] = useMemo(
    () => {
      return createTableNftData({ nfts, findBestOffer, findOfferInCart })
    },
    //? Because we need to recalc tableNftData each time offerByMint
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nfts, findBestOffer, findOfferInCart, offerByMint],
  )

  const goToLoansPage = () => {
    navigate(PATHS.LOANS)
  }

  const borrow = async (nft: TableNftData) => {
    const { marketPubkey } = nft.nft.loan

    const offer = findBestOffer({ marketPubkey })
    const rawOffer = rawOffers[marketPubkey]?.find(
      ({ publicKey }) => publicKey === offer?.publicKey,
    )

    if (!offer || !rawOffer) return

    const txnResults = await executeBorrow({
      walletAndConnection: {
        wallet,
        connection,
      },
      txnParams: [
        [
          {
            loanValue: nft.loanValue,
            nft: nft.nft,
            offer: rawOffer,
          },
        ],
      ],
      addLoansOptimistic,
      updateOffersOptimistic,
      isLedger,
    })

    if (txnResults?.length) {
      goToLoansPage()
    }
  }

  const borrowAll = async () => {
    const txnParams = createBorrowAllParams(offerByMint, nfts, rawOffers)

    const txnsResults = await executeBorrow({
      walletAndConnection: {
        wallet,
        connection,
      },
      txnParams,
      addLoansOptimistic,
      updateOffersOptimistic,
      isLedger,
    })

    if (txnsResults?.length) {
      goToLoansPage()
    }
  }

  const onSelectAll = () => {
    if (isEmpty(offerByMint)) {
      const mintsByMarket = Object.fromEntries(
        Object.entries(groupBy(nfts, ({ loan }) => loan.marketPubkey)).map(
          ([marketPubkey, nfts]) => [marketPubkey, nfts.map(({ mint }) => mint)],
        ),
      )
      addNftsAuto({ mintsByMarket })
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

  const { viewState } = useTableView()

  const columns = getTableColumns({
    onNftSelect,
    onBorrow: borrow,
    isCardView: viewState === ViewState.CARD,
    findOfferInCart,
  })

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_TABLE_SORT)

  const filteredNfts = useFilteredNfts(tableNftsData, selectedOptions)
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

  const nftsInCart = useMemo(() => {
    const mints = Object.keys(offerByMint)
    return tableNftsData.filter(({ mint }) => mints.includes(mint))
  }, [offerByMint, tableNftsData])

  return {
    tableNftData: sortedNfts,
    columns,
    onRowClick: onNftSelect,
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
        labels: ['Collection', 'Nfts'],
        onChange: setSelectedOptions,
      },
      sortParams: {
        option: sortOption,
        onChange: setSortOption,
        className: styles.sortDropdown,
        options: SORT_OPTIONS,
      },
    },
    borrow,
    borrowAll,
    selectAll: onSelectAll,
    nftsInCart,
    findOfferInCart,
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
      [SortField.BORROW]: 'loanValue',
      [SortField.FLOOR]: 'nft.nft.collectionFloor',
      [SortField.FEE]: 'interest',
    }

    const sorted = sortBy(nfts, (nft) => {
      const sortValue = sortValueMapping[name as SortField]
      return get(nft, sortValue)
    })

    return order === 'desc' ? sorted.reverse() : sorted
  }, [sortOptionValue, nfts])

  return sortedLoans
}
