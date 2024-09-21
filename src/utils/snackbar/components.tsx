import { FC, ReactNode } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { SolanaFMLink } from '@banx/components/SolanaLinks'

import { Copy } from '@banx/icons'

import { copyToClipboard } from '../common'
import { SnackbarType, enqueueSnackbar } from './'

import styles from './Snackbar.module.less'

export type CopyButtonProps = Partial<{
  label: string
  textToCopy: string
}>

export interface SnackMessageProps {
  message: string
  solanaExplorerPath?: string
}
export const SnackMessage: FC<SnackMessageProps> = ({ message, solanaExplorerPath }) => (
  <div className={styles.snackMessageWrapper}>
    {solanaExplorerPath && (
      <SolanaFMLink className={styles.solanaFMBtn} size="small" path={solanaExplorerPath} />
    )}
    {message}
  </div>
)

export interface SnackDescriptionProps {
  description: string | ReactNode
  type: SnackbarType
  copyButtonProps?: CopyButtonProps
}
export const SnackDescription: FC<SnackDescriptionProps> = ({
  description,
  type,
  copyButtonProps = {},
}) => {
  const { label: copyBtnLabel = 'Copy', textToCopy } = copyButtonProps

  const onBtnClick = () => {
    copyToClipboard(textToCopy || '')
    enqueueSnackbar({
      message: 'Copied to clipboard',
      autoHideDuration: 1,
    })
  }

  return (
    <div
      className={classNames(
        styles.snackDescriptionWrapper,
        styles[`snackDescriptionWrapper__${type}`],
      )}
    >
      {description}
      {!!textToCopy && (
        <Button onClick={onBtnClick} type="circle" variant="tertiary">
          <Copy />
          {copyBtnLabel}
        </Button>
      )}
    </div>
  )
}
