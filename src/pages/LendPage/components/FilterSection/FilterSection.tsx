import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'
import { SortDropdown, SortDropdownProps } from '@banx/components/SortDropdown'

import styles from './FilterSection.module.less'

interface FilterSectionProps<T> {
  searchSelectParams: SearchSelectProps<T>
  sortParams: SortDropdownProps
}

const FilterSection = <T extends object>({
  searchSelectParams,
  sortParams,
}: FilterSectionProps<T>) => {
  return (
    <div className={styles.container}>
      <SearchSelect className={styles.searchSelect} {...searchSelectParams} />
      <SortDropdown {...sortParams} />
    </div>
  )
}

export default FilterSection
