import { FC } from 'react'

import { SearchOutlined } from '@ant-design/icons'
import Select, { BaseOptionType } from 'antd/lib/select'
import classNames from 'classnames'

import { ChevronDown } from '@banx/icons'

import { OptionKeys } from './types'

import styles from './SearchSelect.module.less'

export const PrefixInput = () => (
  <div className={styles.prefix}>
    <SearchOutlined />
  </div>
)

export const SuffixIcon = ({ isPopupOpen }: { isPopupOpen: boolean }) => (
  <ChevronDown className={isPopupOpen ? styles.rotate : ''} />
)

export const SelectLabels = ({ labels = [] }: { labels?: string[] }) => (
  <div className={styles.labels}>
    {labels.map((label) => (
      <span key={label}>{label}</span>
    ))}
  </div>
)

interface OptionProps {
  option: BaseOptionType
  optionKeys: OptionKeys
  selectedOptions?: string[]
}

export const renderOption: FC<OptionProps> = ({ option, optionKeys, selectedOptions = [] }) => {
  const { labelKey, secondLabel, valueKey, imageKey } = optionKeys

  const value = option[valueKey]
  const label = option[labelKey]
  const image = option[imageKey]

  const secondValue = secondLabel ? option[secondLabel.key] : ''

  const isOptionSelected = selectedOptions.includes(label)

  return (
    <Select.Option key={value} value={label}>
      <div className={styles.optionWrapper}>
        <div className={styles.flexRow}>
          <div className={classNames('searchSelectImageContainer', styles.relativeImageContainer)}>
            {image && <img className={styles.image} src={image} />}
            {isOptionSelected && <div className={styles.selected} />}
          </div>
          <p className={styles.label}>{label}</p>
        </div>
        <SecondValue secondLabel={secondLabel} value={secondValue} />
      </div>
    </Select.Option>
  )
}

interface SecondValueProps {
  secondLabel?: OptionKeys['secondLabel']
  value: string
}

const SecondValue: FC<SecondValueProps> = ({ secondLabel, value }) => {
  if (!value) return <p>--</p>

  const formattedValue = secondLabel?.format ? secondLabel.format(value) : value

  return <p className={styles.secondValue}>{formattedValue}</p>
}
