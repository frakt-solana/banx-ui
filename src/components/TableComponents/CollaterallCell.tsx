import { FC } from 'react'

import classNames from 'classnames'

import { ViewState, useTableView } from '@banx/store'

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
  const { viewState } = useTableView()
  const isCardView = viewState === ViewState.CARD

  const [nftCollectionName, nftNumber] = nftName.split('#')
  const displayNftNumber = nftNumber ? `#${nftNumber}` : ''

  return (
    <div className={styles.nftInfo}>
      {onCheckboxClick && !isCardView && (
        <Checkbox className={styles.checkbox} onChange={onCheckboxClick} checked={selected} />
      )}
      <div className={styles.nftImageWrapper}>
        <img src={nftImage} className={styles.nftImage} />
        {selected && isCardView && <div className={styles.selectedCollectionOverlay} />}
      </div>
      <div className={styles.nftNames}>
        <p
          className={classNames(styles.nftCollectionName, {
            [styles.nftCollectionNameEllipsis]: !isCardView,
          })}
        >
          {nftCollectionName}
        </p>
        {displayNftNumber && <p className={styles.nftNumber}>{displayNftNumber}</p>}
      </div>
    </div>
  )
}
