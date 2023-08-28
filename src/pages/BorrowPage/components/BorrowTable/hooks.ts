import { useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chunk, filter, first, get, groupBy, includes, isEmpty, map, sortBy } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { SortOption } from '@banx/components/SortDropdown'

import { BorrowNft, Loan, Offer } from '@banx/api/core'
import { PATHS } from '@banx/router'
import { ViewState, useIsLedger, useOptimisticLoans, useTableView } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { LOANS_PER_TXN, MakeBorrowActionParams, makeBorrowAction } from '@banx/transactions/borrow'

import { CartState, useCartState } from '../../cartState'
import { useBorrowNfts, useHiddenNftsMints } from '../../hooks'
import { SimpleOffer } from '../../types'
import { getTableColumns } from './columns'
import { DEFAULT_TABLE_SORT, ONE_WEEK_IN_SECONDS } from './constants'
import { calcInterest } from './helpers'
import { SortField, TableNftData } from './types'

import styles from './BorrowTable.module.less'

const createTableNftData = ({
  nfts,
  findOfferInCart,
  findBestOffer,
}: {
  nfts: BorrowNft[]
  findOfferInCart: CartState['findOfferInCart']
  findBestOffer: CartState['findBestOffer']
}) => {
  return nfts.map((nft) => {
    const offer = findOfferInCart({ mint: nft.mint })

    const loanValue =
      offer?.loanValue || findBestOffer({ marketPubkey: nft.loan.marketPubkey })?.loanValue || 0

    const selected = !!offer

    const interest = calcInterest({
      timeInterval: ONE_WEEK_IN_SECONDS,
      loanValue,
      apr: nft.loan.marketApr,
    })

    return { mint: nft.mint, nft, loanValue, selected, interest }
  })
}

export const useBorrowTable = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const navigate = useNavigate()
  const { isLedger } = useIsLedger()

  const { nfts, isLoading, rawOffers } = useBorrowNfts()
  const { offerByMint, addNft, removeNft, findOfferInCart, findBestOffer, addNftsAuto, resetCart } =
    useCartState()
  const { add: addLoansOptimistic } = useOptimisticLoans()
  const { add: hideNftMints } = useHiddenNftsMints()

  const tableNftsData: TableNftData[] = useMemo(
    () => {
      return createTableNftData({ nfts, findBestOffer, findOfferInCart })
    },
    //? Because we need to recalc tableNftData each time offerByMint
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nfts, findBestOffer, findOfferInCart, createTableNftData, offerByMint],
  )

  const goToLoansPage = () => {
    navigate(PATHS.LOANS)
  }

  const borrow = async (nft: TableNftData) => {
    const { marketPubkey } = nft.nft.loan

    const offer = findBestOffer({ marketPubkey })
    const rawOffer = rawOffers[marketPubkey].find(({ publicKey }) => publicKey === offer?.publicKey)

    if (!offer || !rawOffer) return

    const txnResults = await new TxnExecutor(makeBorrowAction, { wallet, connection })
      .addTxnParam([
        {
          loanValue: nft.loanValue,
          nft: nft.nft,
          offer: rawOffer,
        },
      ])
      .on('pfSuccessEvery', (loans: Loan[][]) => {
        const loansFlat = loans.flat()
        addLoansOptimistic(...loansFlat)
        hideNftMints(...loansFlat.map(({ nft }) => nft.mint))
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()

    if (txnResults?.length) {
      goToLoansPage()
    }
  }

  const borrowAll = async () => {
    const txnParams = createBorrowAllParams(offerByMint, nfts, rawOffers)

    const txnsResults = await new TxnExecutor(
      makeBorrowAction,
      { wallet, connection },
      { signAllChunks: isLedger ? 1 : 40, rejectQueueOnFirstPfError: true },
    )
      .addTxnParams(txnParams)
      .on('pfSuccessEvery', (loans: Loan[][]) => {
        const loansFlat = loans.flat()
        addLoansOptimistic(...loansFlat)
        hideNftMints(...loansFlat.map(({ nft }) => nft.mint))
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()

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
    isCartEmpty: isEmpty(offerByMint),
    onBorrow: borrow,
    isCardView: viewState === ViewState.CARD,
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
    selectAll: onSelectAll,
    nftsInCart,
  }
}

const createBorrowAllParams = (
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
    }

    const sorted = sortBy(nfts, (nft) => {
      const sortValue = sortValueMapping[name as SortField]
      return get(nft, sortValue)
    })

    return order === 'desc' ? sorted : sorted.reverse()
  }, [sortOptionValue, nfts])

  return sortedLoans
}
