import { FC } from 'react'

import classNames from 'classnames'
import { NavLink } from 'react-router-dom'

import { Button } from '../Buttons'

import styles from './EmptyList.module.less'

interface EmptyListProps {
  message: string
  buttonText?: string
  path?: string
  className?: string
}

const EmptyList: FC<EmptyListProps> = ({ message, buttonText, path, className }) => {
  return (
    <div className={classNames(styles.wrapper, className)}>
      <div className={styles.emptyList}>
        <span className={styles.emptyListMessage}>{message}</span>
      </div>
      {buttonText && path && (
        <NavLink to={path} className={styles.emptyListButton}>
          <Button>{buttonText}</Button>
        </NavLink>
      )}
    </div>
  )
}

export default EmptyList
