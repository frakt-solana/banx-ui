import { AdventureNft, BanxStakeState } from '@banx/api/adventures'

export const calcNftsPartnerPoints = (nfts: AdventureNft[] = []) => {
  return nfts.reduce((acc, { meta }) => acc + Number(meta.partnerPoints), 0)
}

export const isNftStaked = (nft: AdventureNft) => {
  return nft?.banxStake?.banxStakeState === BanxStakeState.Staked
}
