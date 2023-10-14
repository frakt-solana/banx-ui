import { FC } from 'react'

import { Button, ButtonProps } from './Button'

export const CSVDownloadButton: FC<ButtonProps> = ({ ...props }) => {
  return <Button {...props}>Download .CSV</Button>
}
