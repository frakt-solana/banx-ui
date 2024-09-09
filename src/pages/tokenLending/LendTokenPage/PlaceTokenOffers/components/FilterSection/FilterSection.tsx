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
        <CategoryFilter selectedCategory={selectedCategory} onChange={onChangeCategory} />
        <SearchSelect
          {...searchSelectParams}
          className={styles.searchSelect}
          collapsed={searchSelectCollapsed}
          onChangeCollapsed={setSearchSelectCollapsed}
          disabled={!searchSelectParams.options.length}
          defaultCollapsed
        />
      </div>

      <SortDropdown
        {...sortParams}
        className={classNames({ [styles.sortDropdown]: !searchSelectCollapsed })}
      />
    </div>
  )
}
export default FilterSection

interface CategoryFilterProps {
  selectedCategory: MarketCategory
  onChange: (category: MarketCategory) => void
}

const CategoryFilter: FC<CategoryFilterProps> = ({ selectedCategory, onChange }) => {
  return (
    <>
      <div className={styles.categories}>
        {MARKETS_CATEGORIES.map(({ key, label }) => (
          <div
            key={key}
            onClick={() => onChange(key)}
            className={classNames(styles.category, {
              [styles.active]: key === selectedCategory,
            })}
          >
            {label}
          </div>
        ))}
      </div>

      <CategoryDropdown
        options={MARKETS_CATEGORIES}
        selectedOption={selectedCategory}
        onChange={onChange}
      />
    </>
  )
}

interface CategoryDropdownProps {
  options: { key: MarketCategory; label: string }[]
  selectedOption: MarketCategory
  onChange: (category: MarketCategory) => void
}

export const CategoryDropdown: FC<CategoryDropdownProps> = ({
  selectedOption,
  options,
  onChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

  const dropdownRef = useRef(null)
  useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false))

  const toggleDropdown = () => {
    setIsDropdownOpen((prevOpen) => !prevOpen)
  }

  return (
    <div ref={dropdownRef}>
      <Button
        type="circle"
        variant="tertiary"
        className={classNames(styles.dropdownButton, { [styles.isOpen]: isDropdownOpen })}
        onClick={toggleDropdown}
      >
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
