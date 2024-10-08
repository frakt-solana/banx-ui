import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { convertBondOfferV3ToCore } from '@banx/api/nft'
import { UserVault, fetchUserVaults } from '@banx/api/shared'
import { useClusterStats } from '@banx/hooks'
import { useUserOffers } from '@banx/pages/nftLending/OffersPage/components/OffersTabContent'
import { useTokenOffersPreview } from '@banx/pages/tokenLending/OffersTokenPage/components/OffersTokenTabContent'
import { AssetMode, useAssetMode, useTokenType } from '@banx/store/common'

import { getLenderVaultInfo } from './helpers'

export const useUserVault = () => {
  const { publicKey } = useWallet()
  const walletPublicKey = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const {
    data: userVaults,
    isLoading,
    refetch,
  } = useQuery(['userVaults', walletPublicKey], () => fetchUserVaults({ walletPublicKey }), {
    staleTime: 60_000,
    enabled: !!publicKey,
    refetchOnWindowFocus: false,
  })

  const userVault: UserVault | undefined = userVaults?.find(
    (vault) => vault.lendingTokenType === tokenType,
  )

  return {
    userVault,
    isLoading,
    refetch,
  }
}

export const useLenderVaultInfo = () => {
  const { currentAssetMode } = useAssetMode()
  const { userVault } = useUserVault()

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
    if (currentAssetMode === AssetMode.NFT) {
      return nftsRawOffers
    }

    return tokenRawOffers
  }, [currentAssetMode, nftsRawOffers, tokenRawOffers])

  const lenderVaultInfo = getLenderVaultInfo({ userVault, clusterStats })

  return { offers, lenderVaultInfo, updateTokenOffer, clusterStats, updateNftOffer }
}
