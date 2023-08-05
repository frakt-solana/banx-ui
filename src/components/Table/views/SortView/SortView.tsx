import { ColumnsType } from 'antd/es/table'

import { SearchSelect } from '@banx/components/SearchSelect'

import { SwitchModeButtons } from './components'

import styles from './SortView.module.less'

interface SortViewProps<T> {
  columns: ColumnsType<T>
  searchSelectParams?: any
}

const SortView = <T extends object>({ searchSelectParams }: SortViewProps<T>) => {
  return (
    <div className={styles.sortWrapper}>
      <SearchSelect className={styles.searchSelect} {...searchSelectParams} />
      <div className={styles.rowGap}>
        <SwitchModeButtons viewState="table" onChange={() => {}} />
      </div>
    </div>
  )
}

export default SortView
