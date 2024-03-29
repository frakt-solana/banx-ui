import { FC } from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'
import classNames from 'classnames'

import Tooltip from '../Tooltip'

import styles from './TableCells.module.less'

interface HorizontalCellProps {
  value: string | number | JSX.Element

  tooltipContent?: string | JSX.Element
  isHighlighted?: boolean
  textColor?: string
}

export const HorizontalCell: FC<HorizontalCellProps> = ({
  tooltipContent,
  value,
  textColor = '',
  isHighlighted = false,
}) => {
  const cellContent = (
    <span
      style={{ color: textColor }}
      className={classNames(styles.rowCellTitle, { [styles.highlight]: isHighlighted })}
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
