import { FC, ReactNode } from 'react'

import classNames from 'classnames'

import { useImagePreload } from '@banx/hooks'
import { PlaceholderPFP } from '@banx/icons'
import { ViewState, useTableView } from '@banx/store'

import Checkbox from '../Checkbox'
import Tooltip from '../Tooltip/Tooltip'

import styles from './TableCells.module.less'

interface NftInfoCellProps {
  nftName: string
  nftImage: string
  selected?: boolean
  onCheckboxClick?: () => void

  checkboxClassName?: string

  banxPoints?: {
    partnerPoints: number
    playerPoints: number
  }

  rightContentJSX?: ReactNode
  hiddenCollectionName?: boolean
}

const createDisplayNftNamesJSX = (
  nftName: string,
  isCardView: boolean,
  hiddenCollectionName: boolean,
) => {
  const [collectionName, nftId] = nftName.split('#')

  const defaultNftIdName = hiddenCollectionName ? collectionName : ''
  const displayNftId = nftId ? `#${nftId}` : defaultNftIdName

  const ellipsisClass = { [styles.ellipsis]: !isCardView }

  return (
    <div className={styles.nftNames}>
      {!hiddenCollectionName && (
        <p className={classNames(styles.nftCollectionName, ellipsisClass)}>{collectionName}</p>
      )}

      <p className={classNames(styles.nftNumber, ellipsisClass)}>{displayNftId}</p>
    </div>
  )
}

export const NftInfoCell: FC<NftInfoCellProps> = ({
  nftName,
  nftImage,
  onCheckboxClick,
  selected = false,
  banxPoints,
  checkboxClassName,
  hiddenCollectionName = false,
  rightContentJSX,
}) => {
  const { viewState } = useTableView()
  const isCardView = viewState === ViewState.CARD

  return (
    <div className={styles.nftInfo}>
      {onCheckboxClick && !isCardView && (
        <Checkbox
          className={classNames(styles.checkbox, checkboxClassName)}
          onChange={onCheckboxClick}
          checked={selected}
        />
      )}

      <div className={styles.nftImageWrapper}>
        {!!banxPoints?.partnerPoints && <PointsBanxBadge {...banxPoints} />}
        <NftImage nftImage={nftImage} />
        {selected && isCardView && <div className={styles.selectedCollectionOverlay} />}
      </div>

      {createDisplayNftNamesJSX(nftName, isCardView, hiddenCollectionName)}
      {rightContentJSX}
    </div>
  )
}

interface NftImageProps {
  nftImage: string
}

export const NftImage: FC<NftImageProps> = ({ nftImage }) => {
  const imageLoaded = useImagePreload(nftImage)

  return imageLoaded ? (
    <img src={nftImage} className={styles.nftImage} />
  ) : (
    <PlaceholderPFP className={styles.nftPlaceholderIcon} />
  )
}

interface PointsBanxBadgeProps {
  playerPoints: number
  partnerPoints: number
  className?: string
}

export const PointsBanxBadge: FC<PointsBanxBadgeProps> = ({
  playerPoints,
  partnerPoints,
  className,
}) => {
  return (
    <Tooltip title="Partner Points / Player Points">
      <div className={classNames(styles.badge, className)}>
        {partnerPoints}/{playerPoints}
      </div>
    </Tooltip>
  )
}
