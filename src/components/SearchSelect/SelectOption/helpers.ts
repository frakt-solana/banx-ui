import { BaseOptionType } from 'antd/lib/select'

import { OptionKeys } from '../types'

import styles from '../SearchSelect.module.less'

export const extractOptionValues = (option: BaseOptionType, optionKeys: OptionKeys) => {
  const { labelKey, valueKey, imageKey, labelIcon, secondLabel: additionalInfo } = optionKeys

  const value = option[valueKey]
  const label = option[labelKey]
  const image = option[imageKey]

  const Icon = labelIcon?.key && option[labelIcon.key] ? labelIcon.icon : null

  return { value, label, image, Icon, additionalInfo }
}

export const getOptionClassName = (index: number) => {
  return index % 2 === 0 ? styles.evenOption : ''
}
