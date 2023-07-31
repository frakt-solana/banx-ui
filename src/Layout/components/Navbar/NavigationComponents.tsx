import classNames from 'classnames'

// import { NavLink } from 'react-router-dom'
import { MenuItem } from './Navbar'
import { Navigation } from './types'

import styles from './Navbar.module.less'

export const createNavigationsLinks = ({ options = [] }: { options: Navigation[] }) => (
  <div className={styles.navigation}>
    {options.map((items, idx) => (
      <MenuItem key={`${items?.pathname}${idx}`} {...items} />
    ))}
  </div>
)

export const createNavigationLink = ({
  icon,
  label,
  className,
  isActive,
  pathname,
  primary,
}: {
  icon: any
  label: string
  className: string
  pathname: any
  isActive: boolean
  param?: string
  primary?: boolean
}) => {
  return (
    <a
      href={pathname}
      className={classNames(styles.link, className, {
        [styles.active]: isActive,
        [styles.primary]: primary,
        [styles.secondary]: !icon,
      })}
    >
      {icon && icon()}
      {label && <span className={styles.label}>{label}</span>}
    </a>
  )
}
