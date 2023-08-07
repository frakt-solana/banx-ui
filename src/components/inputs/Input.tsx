import { ChangeEvent, Ref, forwardRef } from 'react'

import { Input as InputAnt, InputProps as InputPropsAnt, InputRef } from 'antd'
import classNames from 'classnames'

import styles from './Inputs.module.less'

export interface InputProps extends InputPropsAnt {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, forwardedRef) => {
  const { className, error, ...inputProps } = props

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (inputProps.onChange) {
      inputProps.onChange(event)
    }
  }
  return (
    <InputAnt
      className={classNames(styles.input, className)}
      ref={forwardedRef as Ref<InputRef>}
      {...inputProps}
      onChange={handleChange}
    />
  )
})

Input.displayName = 'Input'
