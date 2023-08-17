import { FC } from 'react'

import classNames from 'classnames'

import styles from './Inputs.module.less'

interface InputErrorMessageProps {
  className?: string
  message: string
}

export const InputErrorMessage: FC<InputErrorMessageProps> = ({ className, message }) => {
  const containerClassName = classNames(styles.errors, className)

  return <div className={containerClassName}>{message}</div>
}
