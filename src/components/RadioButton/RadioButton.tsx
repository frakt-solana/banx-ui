import classNames from 'classnames'

import styles from './RadioButton.module.less'

export interface RBOption<T> {
  label: string
  value: T
}

interface RadioButtonProps<T> {
  currentOption: RBOption<T>
  onOptionChange: (nextOption: RBOption<T>) => void
  options: RBOption<T>[]
  className?: string
  disabled?: boolean
}

export const RadioButton = <T extends object>({
  currentOption,
  options,
  onOptionChange,
  className,
  disabled,
}: RadioButtonProps<T>) => {
  return (
    <div className={classNames(styles.radioButtons, className)}>
      {options.map((option) => {
        const stringValue = option.value.toString()
        const checked = option.value === currentOption.value

        return (
          <div
            key={option.label}
            className={classNames(styles.radioButton, {
              [styles.disabledButton]: disabled,
              [styles.active]: checked,
            })}
          >
            <input
              type="radio"
              id={stringValue}
              name={stringValue}
              value={stringValue}
              checked={checked}
              onChange={() => onOptionChange(option)}
              disabled={disabled}
            />
            <label htmlFor={stringValue}>{option.label}</label>
          </div>
        )
      })}
    </div>
  )
}
