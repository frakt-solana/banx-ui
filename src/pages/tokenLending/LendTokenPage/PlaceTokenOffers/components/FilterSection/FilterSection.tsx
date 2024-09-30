import { FC, useRef, useState } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'
import { SortDropdown, SortDropdownProps } from '@banx/components/SortDropdown'

import { MarketCategory } from '@banx/api/tokens'
import { useOnClickOutside } from '@banx/hooks'
import { ChevronDown } from '@banx/icons'

import { SortField } from '../../hooks'
import { MARKETS_CATEGORIES } from './constants'

import styles from './FilterSection.module.less'

interface FilterSectionProps<T> {
  searchSelectParams: SearchSelectProps<T>
  sortParams: SortDropdownProps<SortField>
  selectedCategory: MarketCategory
  onChangeCategory: (category: MarketCategory) => void
}

const FilterSection = <T extends object>({
  searchSelectParams,
  sortParams,
  selectedCategory,
  onChangeCategory,
}: FilterSectionProps<T>) => {
  const [searchSelectCollapsed, setSearchSelectCollapsed] = useState(true)

  return (
    <div className={styles.container}>
      <div className={styles.filterContent}>
        <SearchSelect
          {...searchSelectParams}
          className={styles.searchSelect}
          collapsed={searchSelectCollapsed}
          onChangeCollapsed={setSearchSelectCollapsed}
          disabled={!searchSelectParams.options.length}
        />
        <CategoryDropdown
          selectedOption={selectedCategory}
          onChange={onChangeCategory}
          options={MARKETS_CATEGORIES}
          className={!searchSelectCollapsed ? styles.dropdownHidden : ''}
        />
      </div>

      <SortDropdown
        {...sortParams}
        className={!searchSelectCollapsed ? styles.dropdownHidden : ''}
      />
    </div>
  )
}
export default FilterSection

interface CategoryDropdownProps {
  options: { key: MarketCategory; label: string }[]
  selectedOption: MarketCategory
  onChange: (category: MarketCategory) => void
  className?: string
}

export const CategoryDropdown: FC<CategoryDropdownProps> = ({
  selectedOption,
  options,
  onChange,
  className,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

  const dropdownRef = useRef(null)
  useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false))

  const toggleDropdown = () => {
    setIsDropdownOpen((prevOpen) => !prevOpen)
  }

  return (
    <div className={classNames(styles.dropdownContainer, className)} ref={dropdownRef}>
      <Button
        type="circle"
        variant="tertiary"
        className={classNames(styles.dropdownButton, { [styles.isOpen]: isDropdownOpen })}
        onClick={toggleDropdown}
      >
        <div className={styles.dropdownButtonOverlayLabel}>Filter by</div>

        <span>{selectedOption}</span>
        <ChevronDown
          className={classNames(styles.chevronIcon, { [styles.rotate]: isDropdownOpen })}
        />
      </Button>

      {isDropdownOpen && (
        <div className={styles.dropdown}>
          {options.map((tokenOption) => (
            <Button
              key={tokenOption.key}
              type="circle"
              variant="tertiary"
              onClick={() => onChange(tokenOption.key)}
              className={classNames(styles.dropdownItem, {
                [styles.active]: selectedOption === tokenOption.key,
              })}
            >
              {tokenOption.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
