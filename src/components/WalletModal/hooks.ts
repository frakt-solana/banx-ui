import { useMemo } from 'react'

import { create } from 'zustand'

import { Offer } from '@banx/api/nft'
import { useClusterStats } from '@banx/hooks'
import { useUserOffers } from '@banx/pages/nftLending/OffersPage/components/OffersTabContent'
import { useTokenOffersPreview } from '@banx/pages/tokenLending/OffersTokenPage/components/OffersTokenTabContent'
import { ModeType, useModeType } from '@banx/store/common'

import { getLenderVaultInfo } from './helpers'

interface WalletModalState {
  visible: boolean
  setVisible: (nextValue: boolean) => void
  toggleVisibility: () => void
}

export const useWalletModal = create<WalletModalState>((set) => ({
  visible: false,
  toggleVisibility: () => set((state) => ({ ...state, visible: !state.visible })),
  setVisible: (nextValue) => set((state) => ({ ...state, visible: nextValue })),
}))

export const useLenderVaultInfo = () => {
  const { modeType } = useModeType()
  const { data: clusterStats } = useClusterStats()
  const { offers: nftsOffers, updateOrAddOffer: updateOrAddNftOffer } = useUserOffers()
  const { offersPreview: tokenOffersPreview, updateOrAddOffer: updateOrAddTokenOffer } =
    useTokenOffersPreview()

  const nftsRawOffers = useMemo(() => {
    return nftsOffers.map((offer) => offer.offer)
  }, [nftsOffers])

  const tokenRawOffers = useMemo(() => {
    return tokenOffersPreview.map((offer) => offer.bondOffer)
  }, [tokenOffersPreview])

  const updateOrAddOffer = (offers: Offer[]) => {
    if (modeType === ModeType.NFT) {
      updateOrAddNftOffer(offers)
    } else {
      updateOrAddTokenOffer(offers)
    }
  }

  const rawOffers = useMemo(() => {
    if (modeType === ModeType.NFT) {
      return nftsRawOffers
    }

    return tokenRawOffers
  }, [modeType, nftsRawOffers, tokenRawOffers])

  const lenderVaultInfo = getLenderVaultInfo(rawOffers, clusterStats)

  return { lenderVaultInfo, rawOffers, updateOrAddOffer }
}
