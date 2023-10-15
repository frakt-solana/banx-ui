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
  onClick?: () => void
}

const EmptyList: FC<EmptyListProps> = ({ message, buttonText, path = '', className, onClick }) => {
  const button = (
    <Button onClick={onClick ? onClick : undefined} className={styles.emptyListButton}>
      {buttonText}
    </Button>
  )

  const buttonElement = onClick ? button : <NavLink to={path}>{button}</NavLink>

  return (
    <div className={classNames(styles.wrapper, className)}>
      <div className={styles.emptyList}>
        <span className={styles.emptyListMessage}>{message}</span>
      </div>
      {buttonText && buttonElement}
    </div>
  )
}

export default EmptyList
