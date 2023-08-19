import { endsWith } from 'lodash'

import styles from './SortDropdown.module.less'

export const getSortOrderClassName = (sortOrder: string) => {
  const isAsc = endsWith(sortOrder, 'asc')
  return isAsc ? styles.rotate : ''
}
