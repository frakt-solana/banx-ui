import { FC, ReactNode } from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'
import classNames from 'classnames'

import { Rarity, RarityTier } from '@banx/api/core'

import Tooltip from '../Tooltip'

import styles from './TableCells.module.less'

interface HorizontalCellProps {
  value: string | number | JSX.Element

  className?: string
  tooltipContent?: ReactNode
  isHighlighted?: boolean
  textColor?: string
}

export const HorizontalCell: FC<HorizontalCellProps> = ({
  value,
  className,
  tooltipContent,
  textColor = '',
  isHighlighted = false,
}) => {
  const cellContent = (
    <span
      style={{ color: textColor }}
      className={classNames(
        styles.rowCellTitle,
        className,
        { [styles.highlight]: isHighlighted },
        className,
      )}
    >
      {value}
    </span>
  )

  return tooltipContent ? (
    <div className={styles.rowCell}>
      <Tooltip title={tooltipContent}>
        {cellContent}
        <InfoCircleOutlined className={styles.rowCellTooltipIcon} />
      </Tooltip>
    </div>
  ) : (
    cellContent
  )
}

const RARITY_TIER_COLOR_MAP: Record<RarityTier, string> = {
  [RarityTier.Common]: 'var(--additional-silver-primary)',
  [RarityTier.Uncommon]: 'var(--additional-green-primary)',
  [RarityTier.Rare]: 'var(--additional-blue-primary)',
  [RarityTier.Epic]: 'var(--additional-violet-primary)',
  [RarityTier.Legendary]: 'var(--additional-gold-primary)',
  [RarityTier.Mythic]: 'var(--additional-red-primary)',
}

export const RarityCell: FC<{ rarity: Rarity | undefined }> = ({ rarity }) => {
  const { tier = '', rank = 0 } = rarity || {}

  const color = tier ? RARITY_TIER_COLOR_MAP[tier] : ''

  return (
    <span className={styles.rarityText} style={{ background: color }}>
      {rank}
    </span>
  )
}
