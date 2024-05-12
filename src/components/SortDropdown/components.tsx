import { FC } from 'react'

import classNames from 'classnames'

import { ArrowDown, ChevronDown } from '@banx/icons'

import { Button } from '../Buttons'
import { SortOption, SortOrder } from './SortDropdown'
import { getSortOrderClassName } from './helpers'

import styles from './SortDropdown.module.less'

interface DropdownButtonProps {
  sortOption: any // TODO: remove this any type
  isDropdownOpen: boolean
  toggleDropdown: () => void
}

export const DropdownButton: FC<DropdownButtonProps> = ({
  sortOption,
  isDropdownOpen,
  toggleDropdown,
}) => (
  <Button
    type="circle"
    variant="text"
    className={classNames(styles.dropdownButton, { [styles.isOpen]: isDropdownOpen })}
    onClick={toggleDropdown}
  >
    <div className={styles.dropdownButtonTextContainer}>
      <ArrowDown className={getSortOrderClassName(sortOption.value)} />
      <span className={styles.dropdownButtonText}>{sortOption?.label}</span>
    </div>
    <ChevronDown className={isDropdownOpen ? styles.rotate : ''} />
  </Button>
)

interface SortOptionsProps<T> {
  options: SortOption<T>[]
  selectedOption: SortOption<T>
  onChange: (option: SortOption<T>) => void
}

const orders = ['asc', 'desc'] as Array<SortOrder>

export const SortOptions = <T extends object>({
  options,
  selectedOption,
  onChange,
}: SortOptionsProps<T>) => {
  return options.map((option) => {
    const [optionField] = option.value
    const [selectedOptionField, selectedOptionOrder] = selectedOption.value

    const handleButtonClick = (order: SortOrder) => {
      onChange({ label: option.label, value: [optionField, order] })
    }

    return (
      <div className={styles.sortButtons} key={option.label}>
        {orders.map((order) => (
          <Button
            key={order}
            onClick={() => handleButtonClick(order)}
            className={classNames(styles.sortButton, {
              [styles.active]: selectedOptionField === optionField && selectedOptionOrder === order,
            })}
            type="circle"
            variant="text"
          >
            <ArrowDown className={getSortOrderClassName(order)} />
            {option.label}
          </Button>
        ))}
      </div>
    )
  })
}
