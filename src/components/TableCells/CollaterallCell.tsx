import { FC } from 'react'

import Checkbox from '../Checkbox'

import styles from './TableCells.module.less'

interface NftInfoCellProps {
  nftName: string
  nftImage: string
  selected?: boolean
  onCheckboxClick?: () => void
}

export const NftInfoCell: FC<NftInfoCellProps> = ({
  nftName,
  nftImage,
  onCheckboxClick,
  selected = false,
}) => {
  const [nftCollectionName, nftNumber] = nftName.split('#')
  const displayNftNumber = nftNumber ? `#${nftNumber}` : ''

  return (
    <div className={styles.nftInfo}>
      {onCheckboxClick && (
        <Checkbox className={styles.checkbox} onChange={onCheckboxClick} checked={selected} />
      )}
      <img src={nftImage} className={styles.nftImage} />
      <div className={styles.nftNames}>
        <p className={styles.nftCollectionName}>{nftCollectionName}</p>
        <p className={styles.nftNumber}>{displayNftNumber}</p>
      </div>
    </div>
  )
}
