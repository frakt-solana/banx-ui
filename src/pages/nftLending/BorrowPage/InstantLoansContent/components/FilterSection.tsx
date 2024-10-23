import { useState } from 'react'

import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'

import styles from '../InstantLoansContent.module.less'

interface FilterSectionProps<T> {
  searchSelectParams: SearchSelectProps<T>
}

export const FilterSection = <T extends object>({ searchSelectParams }: FilterSectionProps<T>) => {
  const [searchSelectCollapsed, setSearchSelectCollapsed] = useState(true)

  return (
    <div className={styles.filterSection}>
      <SearchSelect
        {...searchSelectParams}
        className={styles.searchSelect}
        collapsed={searchSelectCollapsed}
        onChangeCollapsed={setSearchSelectCollapsed}
        disabled={!searchSelectParams.options.length}
      />
    </div>
  )
}
