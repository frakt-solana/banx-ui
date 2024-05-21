import { FC, ReactNode } from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'
import classNames from 'classnames'

import { core } from '@banx/api/nft'

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

//TODO: Rewrite via classes
const RARITY_TIER_COLOR_MAP: Record<core.RarityTier, string> = {
  [core.RarityTier.Common]: 'var(--additional-silver-primary)',
  [core.RarityTier.Uncommon]: 'var(--additional-green-primary)',
  [core.RarityTier.Rare]: 'var(--additional-blue-primary)',
  [core.RarityTier.Epic]: 'var(--additional-violet-primary)',
  [core.RarityTier.Legendary]: 'var(--additional-gold-primary)',
  [core.RarityTier.Mythic]: 'var(--additional-red-primary)',
}

export const RarityCell: FC<{ rarity: core.Rarity | undefined }> = ({ rarity }) => {
  const { tier = '', rank = 0 } = rarity || {}

  const color = tier ? RARITY_TIER_COLOR_MAP[tier] : ''

  return (
    <span
      className={classNames(styles.rarityText, { [styles.highlight]: tier })}
      style={{ background: color }}
    >
      {rank}
    </span>
  )
}
