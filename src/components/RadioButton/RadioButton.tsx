import { FC } from 'react'

import classNames from 'classnames'

import styles from './RadioButton.module.less'

export interface RBOption {
  label: string
  value: string
}

export interface RadioButtonProps {
  currentOption: RBOption
  onOptionChange: (nextOption: RBOption) => void
  options: RBOption[]
  className?: string
  disabled?: boolean
}

export const RadioButton: FC<RadioButtonProps> = ({
  currentOption,
  options,
  onOptionChange,
  className,
  disabled,
}) => {
  return (
    <div className={classNames(styles.radioButtons, className)}>
      {options.map((option) => {
        const value = option.value
        const checked = value === currentOption.value

        return (
          <div
            key={option.label}
            onChange={() => onOptionChange(option)}
            className={classNames(styles.radioButton, {
              [styles.disabled]: disabled,
              [styles.active]: checked,
            })}
          >
            <input
              type="radio"
              id={value}
              name={value}
              value={value}
              checked={checked}
              disabled={disabled}
            />
            <label htmlFor={value}>{option.label}</label>
          </div>
        )
      })}
    </div>
  )
}
