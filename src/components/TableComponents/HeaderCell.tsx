import { FC } from 'react'

import Tooltip from '../Tooltip'

import styles from './TableCells.module.less'

interface HeaderCellProps {
  label: string
  value?: string
  tooltipText?: string
}

export const HeaderCell: FC<HeaderCellProps> = ({ label, tooltipText }) => {
  return (
    <div className={styles.headerCell}>
      <span>{label}</span>
      {!!tooltipText && <Tooltip placement="top" title={tooltipText} />}
    </div>
  )
}
