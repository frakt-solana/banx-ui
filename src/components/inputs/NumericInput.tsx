import { ChangeEvent, FC } from 'react'

import { isFinite, toNumber } from 'lodash'

import { Input } from './Input'

export interface NumericInputProps {
  value: string
  onChange: (value: string) => void

  placeholder?: string
  positiveOnly?: boolean
  integerOnly?: boolean
  className?: string
  error?: boolean
  onBlur?: () => void
  disabled?: boolean
}

const NumericInput: FC<NumericInputProps> = ({
  onChange,
  value,
  positiveOnly,
  integerOnly,
  ...props
}) => {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = event.target

    if (positiveOnly && inputValue.startsWith('-')) return
    if (integerOnly && inputValue.includes('.')) return

    if (inputValue === '-' || inputValue === '' || isFinite(toNumber(inputValue))) {
      onChange(inputValue)
    }
  }

  return <Input value={value} onChange={handleInputChange} {...props} />
}

export default NumericInput
