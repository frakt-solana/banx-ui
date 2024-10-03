import { useState } from 'react'

import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'
import { SortDropdown, SortDropdownProps } from '@banx/components/SortDropdown'

import { SortField } from '../hooks'

import styles from '../TokenLoansContent.module.less'

interface FilterSectionProps<T> {
  searchSelectParams: SearchSelectProps<T>
  sortParams: SortDropdownProps<SortField>
}

export const FilterSection = <T extends object>({
  searchSelectParams,
  sortParams,
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
      </div>

      <SortDropdown
        {...sortParams}
        className={!searchSelectCollapsed ? styles.dropdownHidden : ''}
      />
    </div>
  )
}
