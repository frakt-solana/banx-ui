import classNames from 'classnames'

import Tooltip from '@banx/components/Tooltip'

import { RBOption, RadioButton } from './RadioButton'

import styles from './RadioButton.module.less'

interface RadioButtonFieldProps<T> {
  className?: string
  classNameInner?: string
  currentOption: RBOption<T>
  options: RBOption<T>[]
  disabled?: boolean
  onOptionChange: (nextOption: RBOption<T>) => void
  tooltipText?: string
  label?: string
}

export const RadioButtonField = <T extends object>({
  className,
  currentOption,
  options,
  disabled,
  onOptionChange,
  tooltipText,
  label,
  classNameInner,
}: RadioButtonFieldProps<T>): JSX.Element => {
  return (
    <div className={classNames(styles.radio, className)}>
      <div className={styles.radioTitle}>
        <h6 className={styles.subtitle}>{label}</h6>
        {!!tooltipText && <Tooltip placement="bottom" overlay={tooltipText} />}
      </div>
      <RadioButton
        currentOption={currentOption}
        disabled={disabled}
        onOptionChange={onOptionChange}
        options={options}
        className={classNameInner}
      />
    </div>
  )
}
