import { ColumnsType } from 'antd/es/table'
import { isEmpty } from 'lodash'

import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'
import { SortDropdown } from '@banx/components/SortDropdown'
import { Toggle } from '@banx/components/Toggle'

import { ViewState, useTableView } from '../../hooks'
import { SortParams, ToggleParams } from '../../types'
import { SwitchModeButtons } from './components'
import { parseTableColumn } from './helpers'

import styles from './SortView.module.less'

interface SortViewProps<T, P> {
  columns: ColumnsType<T>
  searchSelectParams: SearchSelectProps<P>
  sortParams?: SortParams
  toggleParams?: ToggleParams
}

const SortView = <T extends object, P extends object>({
  columns,
  searchSelectParams,
  sortParams,
  toggleParams,
}: SortViewProps<T, P>) => {
  const { viewState, setViewState } = useTableView()

  const sortableColumns = columns.filter(({ sorter }) => !!sorter)
  const sortDropdownOptions = sortableColumns.map(parseTableColumn)

  const handleViewStateChange = (state: ViewState) => {
    setViewState(state)
  }

  return (
    <div className={styles.sortWrapper}>
      <SearchSelect {...searchSelectParams} />
      <div className={styles.rowGap}>
        <SwitchModeButtons viewState={viewState} onChange={handleViewStateChange} />
        {!isEmpty(toggleParams) && <Toggle {...toggleParams} />}
        {!isEmpty(sortParams) && <SortDropdown {...sortParams} options={sortDropdownOptions} />}
      </div>
    </div>
  )
}

export default SortView
