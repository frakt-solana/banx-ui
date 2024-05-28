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

import { core } from '@banx/api/nft'
import { executeBorrow } from '@banx/pages/nftLending/BorrowPage/InstantLoansContent/components/BorrowTable/helpers'
import { useBorrowNfts } from '@banx/pages/nftLending/BorrowPage/hooks'
import { useMarketsPreview } from '@banx/pages/nftLending/LendPage/hooks'
import { getDialectAccessToken } from '@banx/providers'
import { PATHS } from '@banx/router'
import { createGlobalState, createPathWithParams } from '@banx/store'
import { ModeType, useModal } from '@banx/store/common'
import { useLoansOptimistic, useOffersOptimistic, useTokenType } from '@banx/store/nft'
import { calculateLoanValue } from '@banx/utils'

import { useBorrowerStats } from '../../hooks'

export const useDashboardBorrowTab = () => {
  const { connected } = useWallet()
  const navigate = useNavigate()
  const { tokenType } = useTokenType()

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
    navigate(createPathWithParams(PATHS.BORROW, ModeType.NFT, tokenType))
  }

  const onBorrow = (nft: core.BorrowNft) => {
    borrow(nft)
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
  const navigate = useNavigate()
  const { open, close } = useModal()
  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()

  const { tokenType } = useTokenType()

  const { update: updateOffersOptimistic } = useOffersOptimistic()
  const { add: addLoansOptimistic } = useLoansOptimistic()
  const { nfts, rawOffers, isLoading } = useBorrowNfts()

  const findBestOffer = (marketPubkey: string) => {
    return rawOffers[marketPubkey]?.at(0) ?? null
  }

  const goToLoansPage = () => {
    navigate(createPathWithParams(PATHS.LOANS, ModeType.NFT, tokenType))
  }

  const onBorrowSuccess = () => {
    const isUserSubscribedToNotifications = !!getDialectAccessToken(wallet.publicKey?.toBase58())

    if (!isUserSubscribedToNotifications) {
      open(SubscribeNotificationsModal, {
        title: createLoanSubscribeNotificationsTitle(1),
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

  const borrow = async (nft: core.BorrowNft) => {
    const { marketPubkey } = nft.loan

    const offer = findBestOffer(marketPubkey)
    const rawOffer = rawOffers[marketPubkey]?.find(
      ({ publicKey }) => publicKey === offer?.publicKey,
    )

    if (!offer || !rawOffer) return

    await executeBorrow({
      wallet,
      connection,
      createTxnsDataParams: [
        {
          nft,
          offer: rawOffer,
          loanValue: calculateLoanValue(offer),
          tokenType,
          optimizeIntoReserves: true,
        },
      ],
      addLoansOptimistic,
      updateOffersOptimistic,
      onBorrowSuccess: () => {
        onBorrowSuccess()
      },
      onSuccessAll: () => {
        goToLoansPage()
      },
    })
  }

  return { borrow, nfts, isLoading, findBestOffer }
}

const useCollectionsStore = createGlobalState<string[]>([])

const useFilteredMarketsAndNFTs = (
  marketsPreview: core.MarketPreview[],
  nfts: core.BorrowNft[],
) => {
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
