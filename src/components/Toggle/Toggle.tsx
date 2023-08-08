import { FC } from 'react'

import classNames from 'classnames'

import styles from './Toggle.module.less'

export interface ToggleProps {
  checked: boolean
  onChange: (value: boolean) => void
  label?: string
  defaultChecked?: boolean
  className?: string
}

export const Toggle: FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  defaultChecked,
  className,
}) => {
  return (
    <label className={classNames(styles.root, className)}>
      <input
        type="checkbox"
        className={styles.input}
        defaultChecked={defaultChecked}
        checked={checked}
        onChange={() => onChange(!checked)}
      />
      <span className={styles.slider} />
      <span className={styles.label}>{label}</span>
    </label>
  )
}
