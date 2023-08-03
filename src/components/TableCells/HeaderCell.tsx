import { FC } from 'react'

import styles from './TableCells.module.less'

interface HeaderCellProps {
  label: string
  columns?: any
  value: string
}

export const HeaderCell: FC<HeaderCellProps> = ({ label }) => {
  return (
    <div className={styles.rowCell}>
      <span>{label}</span>
    </div>
  )
}
