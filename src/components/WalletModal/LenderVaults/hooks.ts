import { useMemo } from 'react'

import { convertBondOfferV3ToCore } from '@banx/api/nft'
import { useClusterStats } from '@banx/hooks'
import { useUserOffers } from '@banx/pages/nftLending/OffersPage/components/OffersTabContent'
import { useTokenOffersPreview } from '@banx/pages/tokenLending/OffersTokenPage/components/OffersTokenTabContent'
import { ModeType, useModeType } from '@banx/store/common'

import { getLenderVaultInfo } from './helpers'

export const useLenderVaultInfo = () => {
  const { modeType } = useModeType()

  const { data: clusterStats } = useClusterStats()

  const { offersPreview: tokenOffersPreview, updateOrAddOffer: updateTokenOffer } =
    useTokenOffersPreview()

  const { offers: nftsOffers, updateOrAddOffer: updateNftOffer } = useUserOffers()

  const tokenRawOffers = useMemo(() => {
    return tokenOffersPreview.map((offer) => convertBondOfferV3ToCore(offer.bondOffer))
  }, [tokenOffersPreview])

  const nftsRawOffers = useMemo(() => {
    return nftsOffers.map((offer) => offer.offer)
  }, [nftsOffers])

  const offers = useMemo(() => {
    if (modeType === ModeType.NFT) {
      return nftsRawOffers
    }

    return tokenRawOffers
  }, [modeType, nftsRawOffers, tokenRawOffers])

  const lenderVaultInfo = getLenderVaultInfo(offers, clusterStats)

  return { offers, lenderVaultInfo, updateTokenOffer, clusterStats, updateNftOffer }
}
