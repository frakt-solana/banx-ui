import { FC } from 'react'

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
}

export const PointsBanxBadge: FC<PointsBanxBadgeProps> = ({ playerPoints, partnerPoints }) => {
  return (
    <Tooltip title="Partner Points / Player Points">
      <div className={styles.badge}>
        {partnerPoints}/{playerPoints}
      </div>
    </Tooltip>
  )
}
