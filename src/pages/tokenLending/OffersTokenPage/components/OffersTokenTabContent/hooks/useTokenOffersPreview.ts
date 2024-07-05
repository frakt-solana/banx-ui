import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { chain, map, maxBy } from 'lodash'

import { Offer } from '@banx/api/nft'
import { TokenMarketPreview, core } from '@banx/api/tokens'
import { useTokenMarketsPreview } from '@banx/pages/tokenLending/LendTokenPage'
import { useNftTokenType } from '@banx/store/nft'
import { isOfferNewer, isOptimisticOfferExpired, useTokenOffersOptimistic } from '@banx/store/token'
import { isOfferClosed } from '@banx/utils'

export const useTokenOffersPreview = () => {
  const { publicKey } = useWallet()
  const walletPubkeyString = publicKey?.toBase58() || ''

  const {
    optimisticOffers,
    remove: removeOffers,
    update: updateOrAddOffer,
  } = useTokenOffersOptimistic()

  const { marketsPreview } = useTokenMarketsPreview()

  const { tokenType } = useNftTokenType()

  const { data, isLoading, isFetching, isFetched } = useQuery(
    ['useTokenOffersPreview', walletPubkeyString, tokenType],
    () => core.fetchTokenOffersPreview({ walletPubkey: walletPubkeyString, tokenType }),
    {
      enabled: !!walletPubkeyString,
      refetchOnWindowFocus: false,
      refetchInterval: 30 * 1000,
    },
  )

  useEffect(() => {
    if (!data) return

    const userOffers = data.map(({ bondOffer }) => bondOffer)

    if (!userOffers || isFetching || !isFetched) return

    const expiredOffersByTime = optimisticOffers.filter((offer) => isOptimisticOfferExpired(offer))

    const optimisticsToRemove = chain(optimisticOffers)
      .filter(({ offer }) => !isOfferClosed(offer))
      .filter(({ offer }) => {
        const sameOfferFromBE = userOffers?.find(({ publicKey }) => publicKey === offer.publicKey)
        if (!sameOfferFromBE) return false
        const isBEOfferNewer = isOfferNewer(sameOfferFromBE, offer)
        return isBEOfferNewer
      })
      .value()

    if (optimisticsToRemove.length || expiredOffersByTime.length) {
      removeOffers(
        map([...expiredOffersByTime, ...optimisticsToRemove], ({ offer }) => offer.publicKey),
      )
    }
  }, [data, isFetching, isFetched, optimisticOffers, removeOffers])

  const offersPreview = useMemo(() => {
    if (!data) return []

    const userOffers = data.map((offer) => offer)

    if (!userOffers || !optimisticOffers) return []

    const optimisticUserOffers = optimisticOffers
      .map(({ offer }) => {
        const tokenMarketPreview = marketsPreview.find(
          ({ marketPubkey }) => marketPubkey === offer.hadoMarket,
        ) as TokenMarketPreview

        return createSynteticOfferPreview(offer, tokenMarketPreview)
      })
      .filter(({ bondOffer }) => bondOffer.assetReceiver === publicKey?.toBase58())

    const combinedOffers = [...optimisticUserOffers, ...userOffers]

    return chain(combinedOffers)
      .groupBy(({ bondOffer }) => bondOffer.publicKey)
      .map((groupedOffers) => maxBy(groupedOffers, ({ bondOffer }) => bondOffer.lastTransactedAt))
      .compact()
      .filter(({ bondOffer }) => !isOfferClosed(bondOffer))
      .value()
  }, [marketsPreview, data, optimisticOffers, publicKey])

  return {
    offersPreview,
    isLoading,
    updateOrAddOffer,
  }
}

const createSynteticOfferPreview = (offer: Offer, tokenMarketPreview: TokenMarketPreview) => {
  const offerSize = offer.fundsSolOrTokenBalance + offer.bidSettlement

  return {
    publicKey: offer.publicKey,
    bondOffer: offer,
    tokenMarketPreview,
    tokenOfferPreview: {
      publicKey: offer.publicKey,
      liquidatedLoansAmount: 0,
      terminatingLoansAmount: 0,
      repaymentCallsAmount: 0,
      accruedInterest: 0,
      inLoans: 0,
      offerSize,
    },
  }
}
