import { ReactNode, useState } from 'react'

import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'
import { SortDropdown } from '@banx/components/SortDropdown'
import { Toggle, ToggleProps } from '@banx/components/Toggle'

import { ViewState, useTableView } from '@banx/store'

import { ColumnType, SortParams } from '../../types'
import { SwitchModeButton } from './components'
import { parseTableColumn } from './helpers'

import styles from './SortView.module.less'

interface SortViewProps<T, P> {
  columns: ColumnType<T>[]
  searchSelectParams: SearchSelectProps<P>
  sortParams?: SortParams
  toggleParams?: ToggleProps
  showCard?: boolean
  customJSX?: ReactNode
}

export const SortView = <T extends object, P extends object>({
  columns,
  searchSelectParams,
  sortParams,
  toggleParams,
  showCard,
  customJSX,
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
      <div className={styles.filters}>
        <SearchSelect
          {...searchSelectParams}
          collapsed={searchSelectCollapsed}
          onChangeCollapsed={setSearchSelectCollapsed}
        />
        {customJSX}
      </div>

      {searchSelectCollapsed && (
        <div className={styles.rowGap}>
          {showCard && <SwitchModeButton viewState={viewState} onChange={handleViewStateChange} />}
          {toggleParams && <Toggle {...toggleParams} />}
          {sortParams && <SortDropdown options={sortDropdownOptions} {...sortParams} />}
        </div>
      )}
    </div>
  )
}
