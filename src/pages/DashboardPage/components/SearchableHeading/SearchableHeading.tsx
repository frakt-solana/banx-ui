import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'

import styles from './SearchableHeading.module.less'

interface SearchableHeadingProps<T> {
  title: string
  searchSelectParams: SearchSelectProps<T>
}

export const SearchableHeading = <T extends SearchableHeadingProps<T>>({
  title,
  searchSelectParams,
}: SearchableHeadingProps<T>) => {
  return (
    <div className={styles.wrapper}>
      <h4 className={styles.searchableHeading}>{title}</h4>
      <SearchSelect {...searchSelectParams} />
    </div>
  )
}
