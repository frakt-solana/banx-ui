import { useState } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'
import { SortDropdown, SortDropdownProps } from '@banx/components/SortDropdown'

import { Fire } from '@banx/icons'

import styles from './FilterSection.module.less'

interface FilterSectionProps<T> {
  searchSelectParams: SearchSelectProps<T>
  sortParams: SortDropdownProps
  onToggleHotFilter: () => void
  isHotFilterActive: boolean
}

const FilterSection = <T extends object>({
  searchSelectParams,
  sortParams,
  onToggleHotFilter,
  isHotFilterActive,
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
        <Button
          className={classNames(styles.filterButton, { [styles.active]: isHotFilterActive })}
          onClick={onToggleHotFilter}
          variant="secondary"
          type="circle"
        >
          <Fire />
        </Button>
      </div>
      {searchSelectCollapsed && <SortDropdown {...sortParams} />}
    </div>
  )
}

export default FilterSection
