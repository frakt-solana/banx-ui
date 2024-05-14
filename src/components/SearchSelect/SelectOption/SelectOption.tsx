import React, { FC } from 'react'

import Select, { BaseOptionType } from 'antd/lib/select'
import classNames from 'classnames'

import { Star, StarActive } from '@banx/icons'

// import { OptionKeys } from '../types'
import { extractOptionValues, getOptionClassName } from './helpers'

import styles from './SelectOption.module.less'

export type OptionClassNameProps = {
  label?: string
  value?: string
}

interface OptionProps {
  option: BaseOptionType
  optionKeys: any
  selectedOptions?: string[]
  index: number
  optionClassNameProps?: OptionClassNameProps

  toggleFavorite?: () => void
  isOptionFavorite?: boolean
}

export const renderOption: FC<OptionProps> = ({
  option,
  optionKeys,
  selectedOptions = [],
  index,
  optionClassNameProps,
  toggleFavorite,
  isOptionFavorite,
}) => {
  const { value, label, image, Icon, additionalInfo } = extractOptionValues(option, optionKeys)

  const isSelected = selectedOptions.includes(label)

  return (
    <Select.Option className={getOptionClassName(index)} key={value} value={label}>
      <div className={styles.optionWrapper}>
        <div className={styles.optionMainInfo}>
          {toggleFavorite && (
            <AddToFavoriteIcon onClick={toggleFavorite} selected={isOptionFavorite} />
          )}
          <ImageContainer image={image} isSelected={isSelected} />
          <p className={classNames(styles.optionLabel, optionClassNameProps?.label)}>{label}</p>
          {Icon}
        </div>
        <AdditionalValue option={option} additionalInfo={additionalInfo} />
      </div>
    </Select.Option>
  )
}

interface AddToFavoriteIconProps {
  selected?: boolean
  onClick: () => void
}

const AddToFavoriteIcon: FC<AddToFavoriteIconProps> = ({ onClick, selected }) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick()
    event.stopPropagation()
  }

  return (
    <div
      className={classNames(styles.addToFavoriteIcon, 'serchSelectFavoriteIcon')}
      onClick={handleClick}
    >
      {selected ? <StarActive /> : <Star />}
    </div>
  )
}

interface ImageContainerProps {
  image: string
  isSelected: boolean
}

const ImageContainer: FC<ImageContainerProps> = ({ image, isSelected }) => (
  <div className={classNames(styles.imageContainer, 'searchSelectImageContainer')}>
    {image && <img className={styles.image} src={image} />}
    {isSelected && <div className={styles.selected} />}
  </div>
)

interface AdditionalValueProps {
  option: BaseOptionType
  additionalInfo: any
}

const AdditionalValue: FC<AdditionalValueProps> = ({ option, additionalInfo }) => {
  const value = additionalInfo ? option[additionalInfo.key] : ''

  if (!value) {
    return <p>--</p>
  }

  const formattedValue = additionalInfo?.format?.(value) ?? value

  return <p className={styles.additionalValue}>{formattedValue}</p>
}
