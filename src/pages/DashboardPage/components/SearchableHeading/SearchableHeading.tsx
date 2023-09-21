import { FC } from 'react'

import styles from './SearchableHeading.module.less'

interface SearchableHeadingProps {
  title: string
}

const SearchableHeading: FC<SearchableHeadingProps> = ({ title }) => {
  return (
    <div className={styles.wrapper}>
      <h4 className={styles.heading}>{title}</h4>
      {/* <SearchSelect /> */}
    </div>
  )
}

export default SearchableHeading
