import { useState } from 'react'

import { ColumnsType } from 'antd/es/table'

import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'
import { SortDropdown } from '@banx/components/SortDropdown'
import { Toggle, ToggleProps } from '@banx/components/Toggle'

import { ViewState, useTableView } from '@banx/store'

import { SortParams } from '../../types'
import { SwitchModeButtons } from './components'
import { parseTableColumn } from './helpers'

import styles from './SortView.module.less'

interface SortViewProps<T, P> {
  columns: ColumnsType<T>
  searchSelectParams: SearchSelectProps<P>
  sortParams?: SortParams
  toggleParams?: ToggleProps
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
  const [searchSelectCollapsed, setSearchSelectCollapsed] = useState(true)

  const sortableColumns = columns.filter((column) => !!column.sorter)
  const sortDropdownOptions = sortableColumns.map(parseTableColumn)

  const handleViewStateChange = (state: ViewState) => {
    setViewState(state)
  }

  return (
    <div className={styles.sortWrapper}>
      <SearchSelect
        {...searchSelectParams}
        collapsed={searchSelectCollapsed}
        onChangeCollapsed={setSearchSelectCollapsed}
      />
      {searchSelectCollapsed && (
        <div className={styles.rowGap}>
          {showCard && <SwitchModeButtons viewState={viewState} onChange={handleViewStateChange} />}
          {toggleParams && <Toggle {...toggleParams} />}
          {sortParams && <SortDropdown options={sortDropdownOptions} {...sortParams} />}
        </div>
      )}
    </div>
  )
}

export default SortView
