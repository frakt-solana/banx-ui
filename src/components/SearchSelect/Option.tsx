import { FC } from 'react'

import { Select } from 'antd'
import { BaseOptionType } from 'antd/lib/select'
import { includes } from 'lodash'

import styles from './SearchSelect.module.less'

export interface OptionKeys {
  labelKey: string
  valueKey: string
  secondLabel?: {
    key: string
    format?: (value: number | string) => string
  }
  imageKey?: string
}

interface OptionProps {
  option: BaseOptionType
  optionKeys?: OptionKeys
  selectedOptions?: string[]
}

export const renderOption: FC<OptionProps> = ({
  option,
  optionKeys = {},
  selectedOptions = [],
}) => {
  const { labelKey, secondLabel, valueKey, imageKey } = optionKeys || {}

  const { [valueKey as any]: value, [labelKey as any]: label, [imageKey as any]: image } = option

  const secondValue = option[(secondLabel as any).key]

  const isOptionSelected = includes(selectedOptions, label)

  return (
    <Select.Option key={value} value={label}>
      <div className={styles.optionWrapper}>
        <div className={styles.flexRow}>
          <div className={styles.relativeImageContainer} id="relativeImageContainer">
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

const SecondValue = ({ secondLabel, value }: any) => {
  if (!value) {
    return <p>--</p>
  }

  const formattedValue = secondLabel.format ? secondLabel.format(value) : value

  return <p className={styles.secondValue}>{formattedValue}</p>
}
