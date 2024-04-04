import { useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { filter, first, groupBy, includes, map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import { DisplayValue } from '@banx/components/TableComponents'
import {
  SubscribeNotificationsModal,
  createLoanSubscribeNotificationsContent,
  createLoanSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { BorrowNft, MarketPreview } from '@banx/api/core'
import { SPECIAL_COLLECTIONS_MARKETS } from '@banx/constants'
import { executeBorrow } from '@banx/pages/BorrowPage/components/BorrowTable/helpers'
import { useBorrowNfts } from '@banx/pages/BorrowPage/hooks'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { PATHS } from '@banx/router'
import {
  useLoansOptimistic,
  useModal,
  useOffersOptimistic,
  usePriorityFees,
  useToken,
} from '@banx/store'
import { createGlobalState } from '@banx/store/functions'
import { calculateLoanValue, getDialectAccessToken, trackPageEvent } from '@banx/utils'

import { useBorrowerStats } from '../../hooks'

export const useDashboardBorrowTab = () => {
  const { connected } = useWallet()
  const navigate = useNavigate()

  const { borrow, nfts, isLoading: isLoadingNFTs, findBestOffer } = useSingleBorrow()

  const { data: borrowerStats } = useBorrowerStats()
  const { marketsPreview, isLoading: isLoadingMarkets } = useMarketsPreview()

  const { filteredMarkets, filteredNFTs, searchSelectParams } = useFilteredMarketsAndNFTs(
    marketsPreview,
    nfts,
  )

  const sortedNFTsByLoanValue = useMemo(() => {
    const nftsWithLoanValue = filteredNFTs.map((nft) => {
      const offer = findBestOffer(nft.loan.marketPubkey)
      const loanValue = offer ? calculateLoanValue(offer) : 0

      return { ...nft, loanValue }
    })

    return [...nftsWithLoanValue].sort((nftA, nftB) => nftB.loanValue - nftA.loanValue)
  }, [filteredNFTs, findBestOffer])

  const headingText = connected ? 'Click to borrow' : '1 click loan'

  const goToBorrowPage = () => {
    navigate(PATHS.BORROW)
    trackPageEvent('dashboard', 'borrowtab-collection')
  }

  const onBorrow = (nft: BorrowNft) => {
    borrow(nft)
    trackPageEvent('dashboard', 'borrowtab-borrow')
  }

  const sortedMarketsByOfferTvl = useMemo(() => {
    return [...filteredMarkets].sort((marketA, marketB) => marketB?.offerTvl - marketA?.offerTvl)
  }, [filteredMarkets])

  return {
    marketsPreview: sortedMarketsByOfferTvl,
    nfts: sortedNFTsByLoanValue,
    borrow: onBorrow,
    findBestOffer,
    borrowerStats,
    headingText,
    searchSelectParams,
    isConnected: connected,
    loading: connected ? isLoadingNFTs : isLoadingMarkets,
    goToBorrowPage,
  }
}

export const useSingleBorrow = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { priorityLevel } = usePriorityFees()
  const navigate = useNavigate()
  const { open, close } = useModal()
  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()

  const { token: tokenType } = useToken()

  const { update: updateOffersOptimistic } = useOffersOptimistic()
  const { add: addLoansOptimistic } = useLoansOptimistic()
  const { nfts, rawOffers, isLoading } = useBorrowNfts()

  const findBestOffer = (marketPubkey: string) => {
    return rawOffers[marketPubkey]?.at(0) ?? null
  }

  const goToLoansPage = () => {
    navigate(PATHS.LOANS)
  }

  const onBorrowSuccess = (showCongrats = false) => {
    const isUserSubscribedToNotifications = !!getDialectAccessToken(wallet.publicKey?.toBase58())

    if (!isUserSubscribedToNotifications || showCongrats) {
      open(SubscribeNotificationsModal, {
        title: createLoanSubscribeNotificationsTitle(1),
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

  const borrow = async (nft: BorrowNft) => {
    const { marketPubkey } = nft.loan

    const offer = findBestOffer(marketPubkey)
    const rawOffer = rawOffers[marketPubkey]?.find(
      ({ publicKey }) => publicKey === offer?.publicKey,
    )

    if (!offer || !rawOffer) return

    await executeBorrow({
      wallet,
      connection,
      txnParams: [
        [
          {
            nft,
            offer: rawOffer,
            loanValue: calculateLoanValue(offer),
            priorityFeeLevel: priorityLevel,
            tokenType,
          },
        ],
      ],
      addLoansOptimistic,
      updateOffersOptimistic,
      onBorrowSuccess: () => {
        onBorrowSuccess(SPECIAL_COLLECTIONS_MARKETS.includes(marketPubkey))
      },
      onSuccessAll: () => {
        goToLoansPage()
      },
    })
  }

  return { borrow, nfts, isLoading, findBestOffer }
}

const useCollectionsStore = createGlobalState<string[]>([])

const useFilteredMarketsAndNFTs = (marketsPreview: MarketPreview[], nfts: BorrowNft[]) => {
  const { connected } = useWallet()

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  const filteredMarkets = useMemo(() => {
    if (selectedCollections.length) {
      return filter(marketsPreview, ({ collectionName }) =>
        includes(selectedCollections, collectionName),
      )
    }
    return marketsPreview
  }, [marketsPreview, selectedCollections])

  const filteredNFTs = useMemo(() => {
    if (selectedCollections.length) {
      return filter(nfts, ({ nft }) => includes(selectedCollections, nft.meta.collectionName))
    }
    return nfts
  }, [nfts, selectedCollections])

  const searchSelectOptions = useMemo(() => {
    const nftsGroupedByCollection = groupBy(nfts, (nft) => nft.nft.meta.collectionName)
    return map(nftsGroupedByCollection, (groupedNfts) => {
      const firstNftInGroup = first(groupedNfts)
      const { collectionName = '', collectionImage = '' } = firstNftInGroup?.nft.meta || {}
      const offerTvl = marketsPreview.find(
        ({ collectionName }) => firstNftInGroup?.nft.meta.collectionName === collectionName,
      )?.offerTvl

      return {
        collectionName,
        collectionImage,
        offerTvl,
      }
    })
  }, [nfts, marketsPreview])

  const searchSelectParams = {
    onChange: setSelectedCollections,
    options: connected ? searchSelectOptions : marketsPreview,
    selectedOptions: selectedCollections,
    optionKeys: {
      labelKey: 'collectionName',
      imageKey: 'collectionImage',
      valueKey: 'collectionName',
      secondLabel: {
        key: 'offerTvl',
        format: (value: number) => <DisplayValue value={value} />,
      },
    },
    labels: ['Collection', 'Liquidity'],
  }

  return { filteredMarkets, filteredNFTs, searchSelectParams }
}
