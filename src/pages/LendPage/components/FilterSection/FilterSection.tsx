import { useState } from 'react'

import { Button } from '@banx/components/Buttons'
import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'
import { SortDropdown, SortDropdownProps } from '@banx/components/SortDropdown'

import { Fire } from '@banx/icons'

import styles from './FilterSection.module.less'

interface FilterSectionProps<T> {
  searchSelectParams: SearchSelectProps<T>
  sortParams: SortDropdownProps
}

const FilterSection = <T extends object>({
  searchSelectParams,
  sortParams,
}: FilterSectionProps<T>) => {
  const [searchSelectCollapsed, setSearchSelectCollapsed] = useState(true)

  return (
    <div className={styles.container}>
      <div className={styles.filterWrapper}>
        <SearchSelect
          {...searchSelectParams}
          className={styles.searchSelect}
          collapsed={searchSelectCollapsed}
          onChangeCollapsed={setSearchSelectCollapsed}
        />
        <Button type="circle" variant="secondary">
          <Fire />
        </Button>
      </div>
      {searchSelectCollapsed && <SortDropdown {...sortParams} />}
    </div>
  )
}

export default FilterSection
