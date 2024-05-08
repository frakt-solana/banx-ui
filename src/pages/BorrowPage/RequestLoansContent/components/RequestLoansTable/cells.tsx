import { FC } from 'react'

import { BorrowNft, RarityTier } from '@banx/api/core'

import styles from './RequestLoansTable.module.less'

const RARITY_TIER_COLOR_MAP: Record<RarityTier, string> = {
  [RarityTier.Common]: 'var(--additional-silver-primary)',
  [RarityTier.Uncommon]: 'var(--additional-green-primary)',
  [RarityTier.Rare]: 'var(--additional-blue-primary)',
  [RarityTier.Epic]: 'var(--additional-violet-primary)',
  [RarityTier.Legendary]: 'var(--additional-gold-primary)',
  [RarityTier.Mythic]: 'var(--additional-red-primary)',
}

export const RarityCell: FC<{ nft: BorrowNft }> = ({ nft }) => {
  const rarity = nft.nft.rarity

  const { tier = '', rank = 0 } = rarity || {}

  const color = tier ? RARITY_TIER_COLOR_MAP[tier] : ''

  return (
    <span className={styles.rarityText} style={{ background: color }}>
      {rank}
    </span>
  )
}
