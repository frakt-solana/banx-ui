import { FC, useMemo } from 'react'

import { NftType } from '@banx/api/banxTokenStake'

import styles from './styled.module.less'

interface Props {
  nfts: NftType[]
}
export const NftsStats: FC<Props> = ({ nfts = [] }) => {
  const walletPartnerPoints = useMemo(
    () => nfts.reduce((acc, { pointsMap }) => acc + Number(pointsMap.partnerPoints), 0),
    [nfts],
  )
  const walletPlayerPoints = useMemo(
    () => nfts.reduce((acc, { pointsMap }) => acc + Number(pointsMap.playerPoints), 0),
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
