import { useCallback, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chain, filter, first, groupBy, includes, isEmpty, map, orderBy } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import { SortOption } from '@banx/components/SortDropdown'
import {
  SubscribeNotificationsModal,
  createLoanSubscribeNotificationsContent,
  createLoanSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { core } from '@banx/api/nft'
import { useBorrowBonkRewardsAvailability } from '@banx/hooks'
import { getDialectAccessToken } from '@banx/providers'
import { PATHS } from '@banx/router'
import { createGlobalState, createPathWithModeParams } from '@banx/store'
import { ModeType, ViewState, useIsLedger, useModal, useTableView } from '@banx/store/common'
import { useLoansOptimistic, useNftTokenType, useOffersOptimistic } from '@banx/store/nft'

import { useCartState } from '../../cartState'
import { getTableColumns } from './columns'
import { executeBorrow, makeCreateTxnsDataParams } from './core'
import { createTableNftData, showBonkRewardsSnack } from './helpers'
import { TableNftData } from './types'

import styles from './BorrowTable.module.less'

export interface UseBorrowTableProps {
  nfts: core.BorrowNft[]
  rawOffers: Record<string, core.Offer[]>
  maxLoanValueByMarket: Record<string, number>
  goToRequestLoanTab: () => void
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
  const { tokenType } = useNftTokenType()

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
    navigate(createPathWithModeParams(PATHS.LOANS, ModeType.NFT, tokenType))
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

  const filteredNfts = useFilteredNfts(tableNftsData, selectedCollections)
  const { sortedNfts, sortParams } = useSortedNfts(filteredNfts)

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
        selectedOptions: selectedCollections,
        labels: ['Collection', 'Nfts'],
        onChange: (value: string[]) => {
          setSelectedCollections(value)
        },
      },
      sortParams,
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

export enum SortField {
  BORROW = 'loanValue',
  FLOOR = 'floorPrice',
  FEE = 'weeklyFee',
}

type SortValueGetter = (nft: TableNftData) => number

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'Borrow', value: [SortField.BORROW, 'desc'] },
  { label: 'Floor', value: [SortField.FLOOR, 'desc'] },
  { label: 'Fee', value: [SortField.FEE, 'desc'] },
]

const SORT_VALUE_MAP: Record<SortField, SortValueGetter> = {
  [SortField.BORROW]: (nft) => nft.loanValue,
  [SortField.FLOOR]: (nft) => nft.nft.nft.collectionFloor,
  [SortField.FEE]: (nft) => nft.interest,
}

const useSortedNfts = (nfts: TableNftData[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])

  const sortedNfts = useMemo(() => {
    if (!sortOption) return nfts

    const [field, order] = sortOption.value

    const sortValueGetter = SORT_VALUE_MAP[field]
    return orderBy(nfts, sortValueGetter, order)
  }, [sortOption, nfts])

  return {
    sortedNfts,
    sortParams: {
      option: sortOption,
      onChange: setSortOption,
      options: SORT_OPTIONS,
    },
  }
}
