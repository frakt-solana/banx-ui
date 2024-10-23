import { useState } from 'react'

import CategoryDropdown from '@banx/components/CategoryDropdown'
import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'
import { SortDropdown, SortDropdownProps } from '@banx/components/SortDropdown'

import { MarketCategory } from '@banx/api/tokens'

import { SortField } from '../OffersTokenTabContent/hooks'

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
        />

        <CategoryDropdown
          selectedOption={selectedCategory}
          onChange={onChangeCategory}
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
