import { ColumnsType } from 'antd/es/table'

import { SearchSelect } from '@banx/components/SearchSelect'
import { SortDropdown } from '@banx/components/SortDropdown'
import { Toggle } from '@banx/components/Toggle'

import { ViewState, useTableView } from '@banx/store'

import { SearchSelectParams, SortParams, ToggleParams } from '../../types'
import { SwitchModeButtons } from './components'
import { parseTableColumn } from './helpers'

import styles from './SortView.module.less'

interface SortViewProps<T, P> {
  columns: ColumnsType<T>
  searchSelectParams: SearchSelectParams<P>
  sortParams?: SortParams
  toggleParams?: ToggleParams
  showCard?: boolean
}

const SortView = <T extends object, P extends object>({
  columns,
  searchSelectParams,
  sortParams,
  toggleParams,
  showCard,
}: SortViewProps<T, P>) => {
  const { viewState, setViewState } = useTableView()

  const sortableColumns = columns.filter((column) => !!column.sorter)
  const sortDropdownOptions = sortableColumns.map(parseTableColumn)

  const handleViewStateChange = (state: ViewState) => {
    setViewState(state)
  }

  return (
    <div className={styles.sortWrapper}>
      <SearchSelect {...searchSelectParams} />
      <div className={styles.rowGap}>
        {showCard && <SwitchModeButtons viewState={viewState} onChange={handleViewStateChange} />}
        {toggleParams && <Toggle {...toggleParams} />}
        {sortParams && <SortDropdown {...sortParams} options={sortDropdownOptions} />}
      </div>
    </div>
  )
}

export default SortView
