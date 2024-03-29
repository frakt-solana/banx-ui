import { FC, useMemo } from 'react'

import { sumBy } from 'lodash'

import { NftType } from '@banx/api/staking'

import styles from './styles.module.less'

interface Props {
  nfts: NftType[]
}
export const NftsStats: FC<Props> = ({ nfts = [] }) => {
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
