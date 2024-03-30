import { FC, useMemo } from 'react'

import { sumBy } from 'lodash'

import { BanxStakeNft } from '@banx/api/staking'

import styles from './StakeNftsModal.module.less'

interface NftsStatsProps {
  nfts: BanxStakeNft[]
}
export const NftsStats: FC<NftsStatsProps> = ({ nfts = [] }) => {
  const walletPartnerPoints = useMemo(
    () => sumBy(nfts, ({ pointsMap }) => pointsMap.partnerPoints),
    [nfts],
  )
  const walletPlayerPoints = useMemo(
    () => sumBy(nfts, ({ pointsMap }) => pointsMap.playerPoints),
    [nfts],
  )

  return (
    <div className={styles.stats}>
      <div className={styles.statsCol}>
        <p>{nfts.length}</p>
        <p>Banx</p>
      </div>
      <div className={styles.statsCol}>
        <p>{walletPartnerPoints}</p>
        <p>Partner points</p>
      </div>
      <div className={styles.statsCol}>
        <p>{walletPlayerPoints}</p>
        <p>Player points</p>
      </div>
    </div>
  )
}
