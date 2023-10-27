import { FC } from 'react'

import classNames from 'classnames'

import { useImagePreload } from '@banx/hooks'
import { PlaceholderPFP } from '@banx/icons'
import { ViewState, useTableView } from '@banx/store'

import Checkbox from '../Checkbox'

import styles from './TableCells.module.less'

interface NftInfoCellProps {
  nftName: string
  nftImage: string
  selected?: boolean
  onCheckboxClick?: () => void

  banxBadgeProps?: {
    partnerPoints: number
    playerPoints: number
  }
}

export const NftInfoCell: FC<NftInfoCellProps> = ({
  nftName,
  nftImage,
  onCheckboxClick,
  selected = false,
  banxBadgeProps,
}) => {
  const { viewState } = useTableView()
  const isCardView = viewState === ViewState.CARD

  const [nftCollectionName, nftNumber] = nftName.split('#')
  const displayNftNumber = nftNumber ? `#${nftNumber}` : ''

  const showPointsBadge = !!banxBadgeProps?.partnerPoints

  return (
    <div className={styles.nftInfo}>
      {onCheckboxClick && !isCardView && (
        <Checkbox className={styles.checkbox} onChange={onCheckboxClick} checked={selected} />
      )}
      <div className={styles.nftImageWrapper}>
        {showPointsBadge && <PointsBanxBadge {...banxBadgeProps} />}
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

const NftImage: FC<NftImageProps> = ({ nftImage }) => {
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

const PointsBanxBadge: FC<PointsBanxBadgeProps> = ({ playerPoints, partnerPoints }) => {
  return (
    <div className={styles.badge}>
      {partnerPoints}/{playerPoints}
    </div>
  )
}
