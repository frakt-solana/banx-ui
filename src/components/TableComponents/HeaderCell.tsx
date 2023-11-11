import { FC } from 'react'

import classNames from 'classnames'

import Tooltip from '../Tooltip'

import styles from './TableCells.module.less'

interface HeaderCellProps {
  label: string
  value?: string
  tooltipText?: string
  align?: 'left' | 'right'
}

export const HeaderCell: FC<HeaderCellProps> = ({ label, tooltipText, align = 'right' }) => {
  return (
    <div className={classNames(styles.headerCell, { [styles.headerCellLeft]: align === 'left' })}>
      <span>{label}</span>
      {!!tooltipText && <Tooltip placement="top" title={tooltipText} />}
    </div>
  )
}
