import { FC } from 'react'

import classNames from 'classnames'

import { useImagePreload } from '@banx/hooks'
import { PlaceholderPFP } from '@banx/icons'
import { ViewState, useTableView } from '@banx/store'
import { createImageSrcWithCdn } from '@banx/utils'

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
}

export const NftInfoCell: FC<NftInfoCellProps> = ({
  nftName,
  nftImage,
  onCheckboxClick,
  selected = false,
  banxPoints,
  checkboxClassName,
}) => {
  const { viewState } = useTableView()
  const isCardView = viewState === ViewState.CARD

  const [nftCollectionName, nftNumber] = nftName.split('#')
  const displayNftNumber = nftNumber ? `#${nftNumber}` : ''

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

interface NftImageProps {
  nftImage: string
  disableCDN?: boolean
}

export const NftImage: FC<NftImageProps> = ({ nftImage, disableCDN = false }) => {
  const imgSrc = disableCDN ? nftImage : createImageSrcWithCdn(nftImage)

  const imageLoaded = useImagePreload(imgSrc)

  return imageLoaded ? (
    <img src={imgSrc} className={styles.nftImage} />
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
