import { FC } from 'react'

import classNames from 'classnames'

import styles from './Toggle.module.less'

export interface ToggleProps {
  checked?: boolean
  onChange: (value: boolean) => void
  label?: string
  defaultChecked?: boolean
  className?: string
  disabled?: boolean
}

export const Toggle: FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  defaultChecked,
  className,
  disabled,
}) => {
  const isControlled = typeof checked === 'boolean'

  return (
    <label className={classNames(styles.root, { [styles.disabled]: disabled }, className)}>
      <input
        type="checkbox"
        className={styles.input}
        defaultChecked={defaultChecked}
        checked={isControlled ? checked : undefined}
        disabled={disabled}
        onChange={(event) => {
          onChange(isControlled ? !checked : event.target.checked)
        }}
      />
      <span className={styles.slider} />
      <span className={styles.label}>{label}</span>
    </label>
  )
}
