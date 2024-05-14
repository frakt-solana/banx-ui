import { useCallback, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chain, filter, first, get, groupBy, includes, isEmpty, map, sortBy } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'
import {
  SubscribeNotificationsModal,
  createLoanSubscribeNotificationsContent,
  createLoanSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { BorrowNft, Offer } from '@banx/api/core'
import { useBorrowBonkRewardsAvailability } from '@banx/hooks'
import { PATHS } from '@banx/router'
import {
  ViewState,
  createPathWithTokenParam,
  useIsLedger,
  useLoansOptimistic,
  useModal,
  useOffersOptimistic,
  useTableView,
  useTokenType,
} from '@banx/store'
import { createGlobalState } from '@banx/store/functions'
import { getDialectAccessToken } from '@banx/utils'

import { useCartState } from '../../cartState'
import { getTableColumns } from './columns'
import { DEFAULT_TABLE_SORT, SORT_OPTIONS } from './constants'
import {
  createTableNftData,
  executeBorrow,
  makeCreateTxnsDataParams,
  showBonkRewardsSnack,
} from './helpers'
import { SortField, TableNftData } from './types'

import styles from './BorrowTable.module.less'

export interface UseBorrowTableProps {
  nfts: BorrowNft[]
  rawOffers: Record<string, Offer[]>
  maxLoanValueByMarket: Record<string, number>
  goToRequestLoanTab: () => void
}

interface SearchSelectOption {
  collectionName: string
  collectionImage: string
  numberOfNFTs: number
}

const useCollectionsStore = createGlobalState<string[]>([])

export const useBorrowTable = ({
  nfts,
  rawOffers,
  maxLoanValueByMarket,
  goToRequestLoanTab,
}: UseBorrowTableProps) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const navigate = useNavigate()
  const { isLedger } = useIsLedger()
  const { open, close } = useModal()
  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()
  const { tokenType } = useTokenType()

  const bonkRewardsAvailable = useBorrowBonkRewardsAvailability()

  const {
    offerByMint,
    offersByMarket,
    addNft,
    addNfts,
    removeNft,
    findOfferInCart,
    findBestOffer,
    resetCart,
  } = useCartState()
  const { add: addLoansOptimistic } = useLoansOptimistic()
  const { update: updateOffersOptimistic } = useOffersOptimistic()

  const [maxBorrowPercent, setMaxBorrowPercent] = useState(100)

  const tableNftsData: TableNftData[] = useMemo(
    () => {
      return createTableNftData({
        nfts,
        findBestOffer,
        findOfferInCart,
        maxLoanValueByMarket,
        maxBorrowPercent,
      }).sort((nftA, nftB) => nftB.nft.nft.meta.name.localeCompare(nftA.nft.nft.meta.name))
    },
    //? Because we need to recalc tableNftData each time offerByMint
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nfts, findBestOffer, findOfferInCart, offerByMint, maxLoanValueByMarket, maxBorrowPercent],
  )

  const goToLoansPage = () => {
    navigate(createPathWithTokenParam(PATHS.LOANS, tokenType))
  }

  const onBorrowSuccess = (loansAmount = 1) => {
    if (bonkRewardsAvailable) {
      showBonkRewardsSnack()
    }

    //? Show notification with an offer to subscribe (if user not subscribed)
    const isUserSubscribedToNotifications = !!getDialectAccessToken(wallet.publicKey?.toBase58())
    if (!isUserSubscribedToNotifications) {
      open(SubscribeNotificationsModal, {
        title: createLoanSubscribeNotificationsTitle(loansAmount),
        message: createLoanSubscribeNotificationsContent(!isUserSubscribedToNotifications),
        onActionClick: !isUserSubscribedToNotifications
          ? () => {
              close()
              setBanxNotificationsSiderVisibility(true)
            }
          : undefined,
        onCancel: close,
      })
    }
  }

  const borrow = async (nft: TableNftData) => {
    const createTxnsDataParams = makeCreateTxnsDataParams([nft], rawOffers, tokenType)

    await executeBorrow({
      wallet,
      connection,
      createTxnsDataParams,
      addLoansOptimistic,
      updateOffersOptimistic,
      onBorrowSuccess,
      onSuccessAll: () => {
        goToLoansPage()
      },
      isLedger,
    })
  }

  const borrowAll = async () => {
    const selectedNfts = tableNftsData.filter(({ mint }) => !!offerByMint[mint])
    const createTxnsDataParams = makeCreateTxnsDataParams(selectedNfts, rawOffers, tokenType)

    await executeBorrow({
      wallet,
      connection,
      createTxnsDataParams,
      addLoansOptimistic,
      updateOffersOptimistic,
      onBorrowSuccess,
      onSuccessAll: () => {
        goToLoansPage()
      },
      isLedger,
    })
  }

  const onNftSelect = useCallback(
    (nft: TableNftData) => {
      const isInCart = !!findOfferInCart({ mint: nft.mint })

      if (isInCart) {
        return removeNft({ mint: nft.mint })
      }

      const bestOffer = findBestOffer({ marketPubkey: nft.nft.loan.marketPubkey })
      if (bestOffer) {
        addNft({ mint: nft.mint, offer: bestOffer })
      }
    },
    [addNft, findBestOffer, findOfferInCart, removeNft],
  )

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_TABLE_SORT)

  const filteredNfts = useFilteredNfts(tableNftsData, selectedCollections)
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

  const maxBorrowAmount = useMemo(() => {
    //? calc amount of nfts that not in cart that user can borrow (if there are offers for them)
    const amountToBorrowNotInCart = chain(filteredNfts)
      .filter(({ selected }) => {
        return !selected
      })
      .groupBy(({ nft }) => nft.loan.marketPubkey)
      .entries()
      .map(([marketPubkey, nfts]) => {
        const availableToBorrow = Math.min(nfts.length, offersByMarket[marketPubkey]?.length || 0)
        return [marketPubkey, availableToBorrow] as [string, number]
      })
      .sumBy(([, amount]) => amount)
      .value()

    //? get amount of nfts that already in cart
    const amountToBorrowInCart = Object.keys(offerByMint).length

    return amountToBorrowNotInCart + amountToBorrowInCart
  }, [offersByMarket, filteredNfts, offerByMint])

  const onSelectNftsAmount = useCallback(
    (amount = 0) => {
      const mintAndMarketArr: Array<[string, string]> = sortedNfts.map(({ mint, nft }) => [
        mint,
        nft.loan.marketPubkey,
      ])

      addNfts({ mintAndMarketArr, amount })
    },
    [addNfts, sortedNfts],
  )

  const onSelectAll = useCallback(() => {
    if (isEmpty(offerByMint)) {
      onSelectNftsAmount(maxBorrowAmount)
    } else {
      resetCart()
    }
  }, [offerByMint, onSelectNftsAmount, maxBorrowAmount, resetCart])

  const { viewState } = useTableView()

  const columns = getTableColumns({
    onNftSelect,
    onBorrow: borrow,
    isCardView: viewState === ViewState.CARD,
    findOfferInCart,
    hasSelectedNfts: !isEmpty(offerByMint),
    goToRequestLoanTab,
    onSelectAll,
    tokenType,
  })

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: { key: 'numberOfNFTs' },
    },
    className: styles.searchSelect,
    selectedOptions: selectedCollections,
    labels: ['Collection', 'Nfts'],
    onChange: setSelectedCollections,
  }

  return {
    tableNftData: sortedNfts,
    columns,
    onRowClick: onNftSelect,
    sortViewParams: {
      searchSelectParams,
      sortParams: {
        option: sortOption,
        onChange: setSortOption,
        options: SORT_OPTIONS,
      },
    },
    borrow,
    borrowAll,
    selectAmount: onSelectNftsAmount,
    nftsInCart,
    findOfferInCart,
    maxBorrowAmount,
    maxBorrowPercent,
    setMaxBorrowPercent,
    bonkRewardsAvailable,
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
