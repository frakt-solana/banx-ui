import { useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { filter, first, groupBy, includes, map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import { createSolValueJSX } from '@banx/components/TableComponents'
import {
  SubscribeNotificationsModal,
  createLoanSubscribeNotificationsContent,
  createLoanSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { BorrowNft, MarketPreview } from '@banx/api/core'
import { executeBorrow } from '@banx/pages/BorrowPage/components/BorrowTable/helpers'
import { useBorrowNfts } from '@banx/pages/BorrowPage/hooks'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { PATHS } from '@banx/router'
import { useLoansOptimistic, useModal, useOffersOptimistic } from '@banx/store'
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

  const headingText = connected ? 'Click to borrow' : '1 click loan'

  const goToBorrowPage = () => {
    navigate(PATHS.BORROW)
    trackPageEvent('dashboard', 'borrowtab-collection')
  }

  const onBorrow = (nft: BorrowNft) => {
    borrow(nft)
    trackPageEvent('dashboard', 'borrowtab-borrow')
  }

  return {
    marketsPreview: filteredMarkets,
    nfts: filteredNFTs,
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

  const { update: updateOffersOptimistic } = useOffersOptimistic()
  const { add: addLoansOptimistic } = useLoansOptimistic()
  const { nfts, rawOffers, isLoading } = useBorrowNfts()

  const findBestOffer = (marketPubkey: string) => {
    return rawOffers[marketPubkey]?.at(0) ?? null
  }

  const goToLoansPage = () => {
    navigate(PATHS.LOANS)
  }

  const onBorrowSuccess = () => {
    if (!getDialectAccessToken(wallet.publicKey?.toBase58())) {
      open(SubscribeNotificationsModal, {
        title: createLoanSubscribeNotificationsTitle(1),
        message: createLoanSubscribeNotificationsContent(),
        onActionClick: () => {
          close()
          setBanxNotificationsSiderVisibility(true)
        },
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

    const txnResults = await executeBorrow({
      walletAndConnection: { wallet, connection },
      txnParams: [[{ nft, offer: rawOffer, loanValue: calculateLoanValue(offer) }]],
      addLoansOptimistic,
      updateOffersOptimistic,
      onSuccessAll: onBorrowSuccess,
    })

    if (txnResults?.length) {
      goToLoansPage()
    }
  }

  return { borrow, nfts, isLoading, findBestOffer }
}

const useFilteredMarketsAndNFTs = (marketsPreview: MarketPreview[], nfts: BorrowNft[]) => {
  const { connected } = useWallet()

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const filteredMarkets = useMemo(() => {
    if (selectedOptions.length) {
      return filter(marketsPreview, ({ collectionName }) =>
        includes(selectedOptions, collectionName),
      )
    }
    return marketsPreview
  }, [marketsPreview, selectedOptions])

  const filteredNFTs = useMemo(() => {
    if (selectedOptions.length) {
      return filter(nfts, ({ nft }) => includes(selectedOptions, nft.meta.collectionName))
    }
    return nfts
  }, [nfts, selectedOptions])

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
    onChange: setSelectedOptions,
    options: connected ? searchSelectOptions : marketsPreview,
    selectedOptions,
    optionKeys: {
      labelKey: 'collectionName',
      imageKey: 'collectionImage',
      valueKey: 'collectionName',
      secondLabel: {
        key: 'offerTvl',
        format: (value: number) => createSolValueJSX(value, 1e9),
      },
    },
    labels: ['Collection', 'Liquidity'],
  }

  return { filteredMarkets, filteredNFTs, searchSelectParams }
}
