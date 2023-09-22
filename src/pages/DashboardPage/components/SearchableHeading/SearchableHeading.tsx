import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'

import styles from './SearchableHeading.module.less'

interface SearchableHeadingProps<T> {
  title: string
  searchSelectParams: SearchSelectProps<T>
}

const SearchableHeading = <T extends SearchableHeadingProps<T>>({
  title,
  searchSelectParams,
}: SearchableHeadingProps<T>) => {
  return (
    <div className={styles.wrapper}>
      <h4 className={styles.heading}>{title}</h4>
      <SearchSelect {...searchSelectParams} />
    </div>
  )
}

export default SearchableHeading
