import { FC } from 'react'

import { SearchOutlined } from '@ant-design/icons'
import Select, { BaseOptionType } from 'antd/lib/select'
import classNames from 'classnames'

import { ChevronDown } from '@banx/icons'

import { Button } from '../Buttons'
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

export type OptionClassNameProps = {
  label?: string
  value?: string
}

interface OptionProps {
  option: BaseOptionType
  optionKeys: OptionKeys
  selectedOptions?: string[]
  index: number
  optionClassNameProps?: OptionClassNameProps
}

export const renderOption: FC<OptionProps> = ({
  option,
  optionKeys,
  selectedOptions = [],
  index,
  optionClassNameProps,
}) => {
  const { labelKey, secondLabel, valueKey, imageKey, labelIcon } = optionKeys

  const value = option[valueKey]
  const label = option[labelKey]
  const image = option[imageKey]
  const Icon = labelIcon?.key && option[labelIcon.key] ? labelIcon.icon : null

  const secondValue = secondLabel ? option[secondLabel.key] : ''
  const isSelected = selectedOptions.includes(label)

  return (
    <Select.Option className={index % 2 === 0 ? styles.evenOption : ''} key={value} value={label}>
      <div className={styles.optionWrapper}>
        <div className={styles.flexRow}>
          <div className={classNames('searchSelectImageContainer', styles.relativeImageContainer)}>
            {image && <img className={styles.image} src={image} />}
            {isSelected && <div className={styles.selected} />}
          </div>
          <p className={classNames(styles.optionLabel, optionClassNameProps?.label)}>{label}</p>
          {Icon}
        </div>
        <SecondValue secondLabel={secondLabel} value={secondValue} />
      </div>
    </Select.Option>
  )
}

interface SecondValueProps {
  secondLabel?: OptionKeys['secondLabel']
  value: number
}

const SecondValue: FC<SecondValueProps> = ({ secondLabel, value }) => {
  if (!value) return <p>--</p>

  const formattedValue = secondLabel?.format ? secondLabel.format(value) : value

  return <p className={styles.secondValue}>{formattedValue}</p>
}

interface CollapsedContentProps {
  onClick: () => void
  selectedOptions: string[]
}
export const CollapsedContent: FC<CollapsedContentProps> = ({ onClick, selectedOptions }) => (
  <div className={styles.collapsedContent}>
    <Button type="circle" variant="secondary" onClick={onClick}>
      {!!selectedOptions?.length && <div className={styles.tip}>{selectedOptions.length}</div>}
      <SearchOutlined />
    </Button>
  </div>
)
