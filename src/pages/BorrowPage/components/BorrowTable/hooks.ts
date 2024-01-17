import { useCallback, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { chain, filter, first, get, groupBy, includes, isEmpty, map, sortBy, sumBy } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import { SortOption } from '@banx/components/SortDropdown'
import {
  SubscribeNotificationsModal,
  createLoanSubscribeNotificationsContent,
  createLoanSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { fetchBorrowBonkRewardsAvailability } from '@banx/api/activity'
import { BorrowNft, Offer } from '@banx/api/core'
import { SPECIAL_COLLECTIONS_MARKETS } from '@banx/constants'
import { PATHS } from '@banx/router'
import {
  ViewState,
  useIsLedger,
  useLoansOptimistic,
  useModal,
  useOffersOptimistic,
  useTableView,
} from '@banx/store'
import { getDialectAccessToken, trackPageEvent } from '@banx/utils'

import { useCartState } from '../../cartState'
import { getTableColumns } from './columns'
import { DEFAULT_TABLE_SORT, SORT_OPTIONS } from './constants'
import { createBorrowParams, createTableNftData, executeBorrow } from './helpers'
import { SortField, TableNftData } from './types'

import styles from './BorrowTable.module.less'

export interface UseBorrowTableProps {
  nfts: BorrowNft[]
  rawOffers: Record<string, Offer[]>
  maxLoanValueByMarket: Record<string, number>
}

export const useBorrowTable = ({ nfts, rawOffers, maxLoanValueByMarket }: UseBorrowTableProps) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const navigate = useNavigate()
  const { isLedger } = useIsLedger()
  const { open, close } = useModal()
  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()

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
    navigate(PATHS.LOANS)
  }

  const onBorrowSuccess = (loansAmount = 1, showCongrats = false) => {
    const isUserSubscribedToNotifications = !!getDialectAccessToken(wallet.publicKey?.toBase58())

    if (!isUserSubscribedToNotifications || showCongrats) {
      open(SubscribeNotificationsModal, {
        title: createLoanSubscribeNotificationsTitle(loansAmount),
        message: createLoanSubscribeNotificationsContent(
          showCongrats,
          !isUserSubscribedToNotifications,
        ),
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
    const txnParams = createBorrowParams([nft], rawOffers)

    const showCongratsMessage = SPECIAL_COLLECTIONS_MARKETS.includes(nft.nft.loan.marketPubkey)

    const txnResults = await executeBorrow({
      walletAndConnection: {
        wallet,
        connection,
      },
      txnParams: txnParams,
      addLoansOptimistic,
      updateOffersOptimistic,
      onSuccessAll: () => onBorrowSuccess(1, showCongratsMessage),
      isLedger,
    })

    if (txnResults?.length) {
      goToLoansPage()
    }
  }

  const borrowAll = async () => {
    const selectedNfts = tableNftsData.filter(({ mint }) => !!offerByMint[mint])
    const txnParams = createBorrowParams(selectedNfts, rawOffers)

    const showCongratsMessage = !!txnParams
      .flat()
      .find(({ offer }) => SPECIAL_COLLECTIONS_MARKETS.includes(offer.hadoMarket))

    const txnsResults = await executeBorrow({
      walletAndConnection: {
        wallet,
        connection,
      },
      txnParams,
      addLoansOptimistic,
      updateOffersOptimistic,
      onSuccessAll: () =>
        onBorrowSuccess(
          sumBy(txnParams, (param) => param.length),
          showCongratsMessage,
        ),
      isLedger,
    })

    if (txnsResults?.length) {
      goToLoansPage()
    }
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
    onSelectAll,
  })

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
        onChange: (value: string[]) => {
          trackPageEvent('borrow', `filter`)
          setSelectedOptions(value)
        },
      },
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

export const useBorrowBonkRewardsAvailability = () => {
  const { data: bonkRewardsAvailable } = useQuery(
    ['borrowBonkRewardsAvailability'],
    () => fetchBorrowBonkRewardsAvailability(),
    {
      staleTime: 20 * 1000, //? 20 sec
      refetchInterval: 30 * 1000, //? 30 sec
      refetchOnWindowFocus: false,
    },
  )
  return bonkRewardsAvailable || false
}
