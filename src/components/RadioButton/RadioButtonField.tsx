import { FC } from 'react'

import classNames from 'classnames'

import Tooltip from '@banx/components/Tooltip'

import { RadioButton, RadioButtonProps } from './RadioButton'

import styles from './RadioButton.module.less'

interface RadioButtonFieldProps extends RadioButtonProps {
  tooltipText?: string
  label?: string
}

export const RadioButtonField: FC<RadioButtonFieldProps> = ({
  className,
  tooltipText,
  label,
  ...props
}) => {
  return (
    <div className={classNames(styles.field, className)}>
      <div className={styles.radioTitle}>
        <h6 className={styles.subtitle}>{label}</h6>
        {!!tooltipText && <Tooltip placement="bottom" overlay={tooltipText} />}
      </div>
      <RadioButton {...props} />
    </div>
  )
}
