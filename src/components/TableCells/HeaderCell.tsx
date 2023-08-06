import { FC } from 'react'

import Tooltip from '../Tooltip'

interface HeaderCellProps {
  label: string
  value: string
  tooltipText?: string
}

export const HeaderCell: FC<HeaderCellProps> = ({ label, tooltipText }) => {
  return (
    <>
      <span>{label}</span>
      {!!tooltipText && <Tooltip placement="top" overlay={tooltipText} />}
    </>
  )
}
