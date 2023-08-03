import { FC } from 'react'

import styles from './TableCells.module.less'

interface CollaterallCellProps {
  collateralName: string
  collateralImage: string
}

export const CollaterallCell: FC<CollaterallCellProps> = ({ collateralName, collateralImage }) => {
  const [nftCollectionName, nftNumber] = collateralName.split('#')

  const displayNftNumber = nftNumber ? `#${nftNumber}` : ''

  return (
    <div className={styles.nftInfo}>
      <img src={collateralImage} className={styles.nftImage} />
      <div className={styles.nftNames}>
        <p className={styles.nftCollectionName}>{nftCollectionName}</p>
        <p className={styles.nftNumber}>{displayNftNumber}</p>
      </div>
    </div>
  )
}
