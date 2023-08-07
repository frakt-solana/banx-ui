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
    <div className={classNames(styles.radioButton, className)}>
      {options.map((option) => {
        const stringValue = option.value.toString()
        return (
          <div
            className={classNames(styles.btn, {
              [styles.disabledButton]: disabled,
            })}
            key={option.label}
          >
            <input
              type="radio"
              id={stringValue}
              name={stringValue}
              value={stringValue}
              checked={option.value === currentOption.value}
              onChange={() => onOptionChange(option)}
            />
            <label htmlFor={stringValue}>{option.label}</label>
          </div>
        )
      })}
    </div>
  )
}
