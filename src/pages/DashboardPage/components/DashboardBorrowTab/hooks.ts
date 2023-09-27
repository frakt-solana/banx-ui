import { useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { filter, includes } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { BorrowNft, MarketPreview } from '@banx/api/core'
import { executeBorrow } from '@banx/pages/BorrowPage/components/BorrowTable/helpers'
import { useBorrowNfts } from '@banx/pages/BorrowPage/hooks'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { PATHS } from '@banx/router'
import { useLoansOptimistic, useOffersOptimistic } from '@banx/store'
import { calculateLoanValue } from '@banx/utils'

import { useBorrowerStats } from '../../hooks'

export const useDashboardBorrowTab = () => {
  const { connected } = useWallet()
  const navigate = useNavigate()

  const { borrow, nfts, isLoading: isLoadingNFTs, findBestOffer } = useSingleBorrow()

  const { data: borrowerStats } = useBorrowerStats()
  const { marketsPreview, isLoading: isLoadingMarkets } = useMarketsPreview()

  const { filteredMarkets, searchSelectParams } = useFilteredMarkets(marketsPreview)

  const hasAnyLoans = borrowerStats ? Object.values(borrowerStats).some((value) => !!value) : false
  const headingText = connected ? 'Click to borrow' : '1 click loan'
  const showMyLoans = connected && hasAnyLoans

  return {
    marketsPreview: filteredMarkets,
    nfts,
    borrow,
    findBestOffer,
    borrowerStats,
    headingText,
    hasAnyLoans,
    showMyLoans,
    searchSelectParams,
    isConnected: connected,
    loading: connected ? isLoadingNFTs : isLoadingMarkets,
    goToBorrowPage: () => navigate(PATHS.BORROW),
  }
}

export const useSingleBorrow = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const navigate = useNavigate()

  const { update: updateOffersOptimistic } = useOffersOptimistic()
  const { add: addLoansOptimistic } = useLoansOptimistic()
  const { nfts, rawOffers, isLoading } = useBorrowNfts()

  const findBestOffer = (marketPubkey: string) => {
    return rawOffers[marketPubkey]?.at(0) ?? null
  }

  const goToLoansPage = () => {
    navigate(PATHS.LOANS)
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
    })

    if (txnResults?.length) {
      goToLoansPage()
    }
  }

  return { borrow, nfts, isLoading, findBestOffer }
}

const useFilteredMarkets = (marketsPreview: MarketPreview[]) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const filteredMarkets = useMemo(() => {
    if (selectedOptions.length) {
      return filter(marketsPreview, ({ collectionName }) =>
        includes(selectedOptions, collectionName),
      )
    }
    return marketsPreview
  }, [marketsPreview, selectedOptions])

  const searchSelectParams = {
    onChange: setSelectedOptions,
    options: marketsPreview,
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

  return { filteredMarkets, searchSelectParams }
}
