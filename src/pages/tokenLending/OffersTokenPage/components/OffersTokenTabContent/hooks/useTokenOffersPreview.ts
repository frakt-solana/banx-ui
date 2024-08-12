import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, map, maxBy } from 'lodash'

import { TokenMarketPreview, core } from '@banx/api/tokens'
import { useTokenMarketsPreview } from '@banx/pages/tokenLending/LendTokenPage'
import { useNftTokenType } from '@banx/store/nft'
import {
  isOfferNewer,
  isOptimisticOfferExpired,
  useTokenOffersOptimistic,
} from '@banx/store/token/useTokenOffersOptimistic'
import { isBondOfferV3Closed } from '@banx/utils/core/tokenOffers'

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
      .filter(({ offer }) => !isBondOfferV3Closed(offer))
      .filter(({ offer }) => {
        const sameOfferFromBE = userOffers?.find(
          ({ publicKey }) => publicKey?.toBase58() === offer.publicKey.toBase58(),
        )
        if (!sameOfferFromBE) return false
        const isBEOfferNewer = isOfferNewer(sameOfferFromBE, offer)
        return isBEOfferNewer
      })
      .value()

    if (optimisticsToRemove.length || expiredOffersByTime.length) {
      removeOffers(
        map(
          [...expiredOffersByTime, ...optimisticsToRemove],
          ({ offer }) => offer.publicKey?.toBase58(),
        ),
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
          ({ marketPubkey }) => marketPubkey === offer.hadoMarket?.toBase58(),
        ) as TokenMarketPreview

        return createSynteticBondOfferV3Preview(offer, tokenMarketPreview)
      })
      .filter(({ bondOffer }) => bondOffer.assetReceiver.toBase58() === publicKey?.toBase58())

    const combinedOffers = [...optimisticUserOffers, ...userOffers]

    return chain(combinedOffers)
      .groupBy(({ bondOffer }) => bondOffer.publicKey)
      .map((groupedOffers) => maxBy(groupedOffers, ({ bondOffer }) => bondOffer.lastTransactedAt))
      .compact()
      .filter(({ bondOffer }) => !isBondOfferV3Closed(bondOffer))
      .value()
  }, [marketsPreview, data, optimisticOffers, publicKey])

  return {
    offersPreview,
    isLoading,
    updateOrAddOffer,
  }
}

const createSynteticBondOfferV3Preview = (
  offer: BondOfferV3,
  tokenMarketPreview: TokenMarketPreview,
) => {
  const offerSize = offer.fundsSolOrTokenBalance.add(offer.bidSettlement).toNumber()

  return {
    publicKey: offer.publicKey?.toBase58(),
    bondOffer: offer,
    tokenMarketPreview,
    tokenOfferPreview: {
      publicKey: offer.publicKey?.toBase58(),
      liquidatedLoansAmount: 0,
      terminatingLoansAmount: 0,
      repaymentCallsAmount: 0,
      accruedInterest: 0,
      inLoans: 0,
      offerSize,
    },
  }
}
