import { OptionKeys } from '../types'

import styles from '../SearchSelect.module.less'

export const extractOptionValues = <T>(option: T, optionKeys: OptionKeys<T>) => {
  const { labelKey, valueKey, imageKey, labelIcon } = optionKeys

  const value = String(option[valueKey])
  const label = String(option[labelKey])
  const image = String(option[imageKey])

  const Icon = labelIcon?.key && option[labelIcon.key] ? labelIcon.icon : null

  return { value, label, image, Icon }
}

export const getOptionClassName = (index: number) => {
  return index % 2 === 0 ? styles.evenOption : ''
}
