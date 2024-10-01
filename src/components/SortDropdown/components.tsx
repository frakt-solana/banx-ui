import classNames from 'classnames'

import { ArrowDown, ChevronDown } from '@banx/icons'

import { Button } from '../Buttons'
import { SortOption, SortOrder } from './SortDropdown'
import { getSortOrderClassName } from './helpers'

import styles from './SortDropdown.module.less'

interface DropdownButtonProps<T> {
  selectedOption: SortOption<T>
  isDropdownOpen: boolean
  toggleDropdown: () => void
}

export const DropdownButton = <T,>({
  selectedOption,
  isDropdownOpen,
  toggleDropdown,
}: DropdownButtonProps<T>) => {
  const { label, value } = selectedOption
  const [, selectedOptionOrder] = value

  return (
    <Button
      type="circle"
      variant="tertiary"
      className={classNames(styles.dropdownButton, { [styles.isOpen]: isDropdownOpen })}
      onClick={toggleDropdown}
    >
      <div className={styles.dropdownButtonTextContainer}>
        <ArrowDown className={getSortOrderClassName(selectedOptionOrder)} />
        <span className={styles.dropdownButtonText}>{label}</span>
      </div>
      <ChevronDown className={isDropdownOpen ? styles.rotate : ''} />
    </Button>
  )
}

interface SortOptionsProps<T> {
  options: SortOption<T>[]
  selectedOption: SortOption<T>
  onChange: (option: SortOption<T>) => void
}

const orders: Array<SortOrder> = ['asc', 'desc']

export const SortOptions = <T,>({ options, selectedOption, onChange }: SortOptionsProps<T>) => {
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
            variant="tertiary"
          >
            <ArrowDown className={getSortOrderClassName(order)} />
            {option.label}
          </Button>
        ))}
      </div>
    )
  })
}
