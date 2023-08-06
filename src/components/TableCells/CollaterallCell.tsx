import { FC } from 'react'

import Checkbox from '../Checkbox'

import styles from './TableCells.module.less'

interface NftInfoCellCellProps {
  nftName: string
  nftImage: string
  selected?: boolean
  onChangeCheckbox?: () => void
}

export const NftInfoCell: FC<NftInfoCellCellProps> = ({
  nftName,
  nftImage,
  onChangeCheckbox,
  selected,
}) => {
  const [nftCollectionName, nftNumber] = nftName.split('#')
  const displayNftNumber = nftNumber ? `#${nftNumber}` : ''

  return (
    <div className={styles.nftInfo}>
      {onChangeCheckbox && (
        <Checkbox
          className={styles.checkbox}
          onChange={onChangeCheckbox}
          checked={selected ?? false}
        />
      )}
      <img src={nftImage} className={styles.nftImage} />
      <div className={styles.nftNames}>
        <p className={styles.nftCollectionName}>{nftCollectionName}</p>
        <p className={styles.nftNumber}>{displayNftNumber}</p>
      </div>
    </div>
  )
}
