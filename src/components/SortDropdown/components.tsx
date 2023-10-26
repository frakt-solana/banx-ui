import { FC } from 'react'

import classNames from 'classnames'

import { ArrowDown, ChevronDown } from '@banx/icons'

import { Button } from '../Buttons'
import { SortOption } from './SortDropdown'
import { getSortOrderClassName } from './helpers'

import styles from './SortDropdown.module.less'

interface DropdownButtonProps {
  sortOption: SortOption
  isDropdownOpen: boolean
  toggleDropdown: () => void
}

export const DropdownButton: FC<DropdownButtonProps> = ({
  sortOption,
  isDropdownOpen,
  toggleDropdown,
}) => (
  <Button type="circle" variant="text" className={styles.dropdownButton} onClick={toggleDropdown}>
    <span className={styles.dropdownButtonText}>Sort:</span>
    <div className={styles.dropdownButtonTextContainer}>
      <ArrowDown className={getSortOrderClassName(sortOption.value)} />
      <span className={styles.dropdownButtonText}>{sortOption?.label}</span>
    </div>
    <ChevronDown className={isDropdownOpen ? styles.rotate : ''} />
  </Button>
)

interface SortButtonProps {
  option: SortOption
  sortOrder: string
  isActive: boolean
  onClick: () => void
}

const SortButton: FC<SortButtonProps> = ({ option, sortOrder, isActive, onClick }) => (
  <Button
    className={classNames(styles.sortButton, { [styles.active]: isActive })}
    type="circle"
    variant="text"
    onClick={onClick}
  >
    {option.label}
    <ArrowDown className={getSortOrderClassName(sortOrder)} />
  </Button>
)

interface SortOptionsProps {
  sortOption: SortOption | null
  options: SortOption[]
  onChange: (sortOrder: string, label: string) => void
}

//TODO: Need to refactor this code, try getting rid of ${value}_${order}
export const SortOptions: FC<SortOptionsProps> = ({ sortOption, options, onChange }) => (
  <>
    {options.map(({ label, value }) => (
      <div className={styles.sortButtons} key={label}>
        {['desc', 'asc'].map((order) => {
          const sortOrder = `${value}_${order}`
          const isActive = sortOption?.value === sortOrder

          return (
            <SortButton
              key={sortOrder}
              option={{ label, value }}
              sortOrder={sortOrder}
              isActive={isActive}
              onClick={() => onChange(sortOrder, label)}
            />
          )
        })}
      </div>
    ))}
  </>
)
