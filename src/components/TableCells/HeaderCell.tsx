import { FC } from 'react'

import Tooltip from '../Tooltip'

interface HeaderCellProps {
  label: string
  columns?: any
  value: string
  tooltipText?: string
}

export const HeaderCell: FC<HeaderCellProps> = ({ label, tooltipText }) => {
  return (
    <div>
      <span>{label}</span>
      {!!tooltipText && <Tooltip placement="top" overlay={tooltipText} />}
    </div>
  )
}
