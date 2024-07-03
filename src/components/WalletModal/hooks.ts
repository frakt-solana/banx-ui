import { useMemo } from 'react'

import { create } from 'zustand'

import { useClusterStats } from '@banx/hooks'
import { useUserOffers } from '@banx/pages/nftLending/OffersPage/components/OffersTabContent/hooks'
import { useTokenOffersPreview } from '@banx/pages/tokenLending/OffersTokenPage/components/OffersTokenTabContent/hooks'
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
  const { offers: nftsOffers } = useUserOffers()
  const { offersPreview: tokenOffersPreview } = useTokenOffersPreview()

  const nftsRawOffers = useMemo(() => nftsOffers.map((offer) => offer.offer), [nftsOffers])

  const tokenRawOffers = useMemo(
    () => tokenOffersPreview.map((offer) => offer.bondOffer),
    [tokenOffersPreview],
  )

  if (modeType === ModeType.NFT) {
    return getLenderVaultInfo(nftsRawOffers, clusterStats)
  }

  return getLenderVaultInfo(tokenRawOffers, clusterStats)
}
