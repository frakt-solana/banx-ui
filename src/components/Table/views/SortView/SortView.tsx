import { ColumnsType } from 'antd/es/table'
import { isEmpty } from 'lodash'

import { SearchSelect } from '@banx/components/SearchSelect'
import { SortDropdown } from '@banx/components/SortDropdown'

import { ViewState, useTableView } from '../../hooks'
import { SwitchModeButtons } from './components'
import { parseTableColumn } from './helpers'

import styles from './SortView.module.less'

interface SortViewProps<T> {
  columns: ColumnsType<T>
  searchSelectParams?: any
  sortParams?: any
}

const SortView = <T extends object>({
  columns,
  searchSelectParams,
  sortParams,
}: SortViewProps<T>) => {
  const { viewState, setViewState } = useTableView()

  const sortableColumns = columns.filter(({ sorter }) => !!sorter)
  const sortDropdownOptions = sortableColumns.map(parseTableColumn)

  const handleViewStateChange = (state: ViewState) => {
    setViewState(state)
  }

  return (
    <div className={styles.sortWrapper}>
      <SearchSelect className={styles.searchSelect} {...searchSelectParams} />
      <div className={styles.rowGap}>
        <SwitchModeButtons viewState={viewState} onChange={handleViewStateChange} />
        {!isEmpty(sortParams) && <SortDropdown {...sortParams} options={sortDropdownOptions} />}
      </div>
    </div>
  )
}

export default SortView
