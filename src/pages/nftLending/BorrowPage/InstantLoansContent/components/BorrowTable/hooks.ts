import { useCallback, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { filter, first, groupBy, includes, map, orderBy } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import { SortOption } from '@banx/components/SortDropdown'
import { ColumnType } from '@banx/components/Table'
import {
  SubscribeNotificationsModal,
  createLoanSubscribeNotificationsContent,
  createLoanSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { core } from '@banx/api/nft'
import { UserVaultPrimitive } from '@banx/api/shared'
import { getDialectAccessToken } from '@banx/providers'
import { PATHS } from '@banx/router'
import { buildUrlWithModeAndToken, createGlobalState } from '@banx/store'
import { AssetMode, useIsLedger, useModal, useTokenType } from '@banx/store/common'
import { useLoansOptimistic, useOffersOptimistic } from '@banx/store/nft'

import { useCartState } from '../../cartState'
import { executeBorrow, makeCreateTxnsDataParams } from './core'
import { createTableNftData } from './helpers'
import { TableNftData } from './types'

import styles from './BorrowTable.module.less'

export interface UseBorrowTableProps {
  nfts: core.BorrowNft[]
  rawOffers: Record<string, core.Offer[]>
  rawUserVaults: UserVaultPrimitive[]
  maxLoanValueByMarket: Record<string, number>
  goToRequestLoanTab: () => void
}

const useCollectionsStore = createGlobalState<string[]>([])

export const useBorrowTable = ({
  nfts,
  rawOffers,
  rawUserVaults,
  maxLoanValueByMarket,
}: UseBorrowTableProps) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const navigate = useNavigate()
  const { isLedger } = useIsLedger()
  const { open, close } = useModal()
  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()
  const { tokenType } = useTokenType()

  const { offerByMint, addNft, removeNft, findOfferInCart, findBestOffer, getBestPriceByMarket } =
    useCartState()
  const { add: addLoansOptimistic } = useLoansOptimistic()
  const { update: updateOffersOptimistic } = useOffersOptimistic()

  const [maxBorrowPercent, setMaxBorrowPercent] = useState(100)

  const tableNftsData: TableNftData[] = useMemo(
    () => {
      return createTableNftData({
        nfts,
        getBestPriceByMarket,
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
    navigate(buildUrlWithModeAndToken(PATHS.LOANS, AssetMode.NFT, tokenType))
  }

  const onBorrowSuccess = (loansAmount = 1) => {
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
    const createTxnsDataParams = makeCreateTxnsDataParams(
      [nft],
      rawOffers,
      rawUserVaults,
      tokenType,
    )

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
    const createTxnsDataParams = makeCreateTxnsDataParams(
      selectedNfts,
      rawOffers,
      rawUserVaults,
      tokenType,
    )

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

      const bestPrice = getBestPriceByMarket({ marketPubkey: nft.nft.loan.marketPubkey })
      if (bestPrice) {
        addNft({ mint: nft.mint, marketPubkey: nft.nft.loan.marketPubkey })
      }
    },
    [addNft, getBestPriceByMarket, findOfferInCart, removeNft],
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

  const columns: ColumnType<TableNftData>[] = []

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
    nftsInCart,
    findOfferInCart,
    maxBorrowPercent,
    setMaxBorrowPercent,
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
