import { FC } from 'react'

import classNames from 'classnames'

import styles from './Checkbox.module.less'

interface CheckboxProps {
  label?: string
  onChange: () => void
  checked: boolean
  className?: string
  classNameInnerContent?: string
}

const Checkbox: FC<CheckboxProps> = ({
  label,
  onChange,
  checked,
  className,
  classNameInnerContent,
}) => {
  return (
    <div className={classNames(styles.checkbox, className)}>
      <label>
        <input onChange={onChange} type="checkbox" checked={checked} />
        <p>{label}</p>
        <span className={classNames(styles.checkboxInput, classNameInnerContent)} />
      </label>
    </div>
  )
}

export default Checkbox
