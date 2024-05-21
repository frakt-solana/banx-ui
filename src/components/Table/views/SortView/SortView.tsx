import { ReactNode, useState } from 'react'

import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'
import { SortDropdown, SortDropdownProps } from '@banx/components/SortDropdown'
import { Toggle, ToggleProps } from '@banx/components/Toggle'

import { ViewState, useTableView } from '@banx/store/common'

import { ColumnType } from '../../types'
import { SwitchModeButton } from './components'

import styles from './SortView.module.less'

interface SortViewProps<DataType, SearchType, SortType> {
  columns: ColumnType<DataType>[]

  searchSelectParams: SearchSelectProps<SearchType>
  sortParams?: SortDropdownProps<SortType>
  toggleParams?: ToggleProps

  customJSX?: ReactNode
  showCard?: boolean
}

export const SortView = <DataType extends object, SearchType extends object, SortType>({
  searchSelectParams,
  sortParams,
  toggleParams,
  showCard,
  customJSX,
}: SortViewProps<DataType, SearchType, SortType>) => {
  const { viewState, setViewState } = useTableView()
  const [searchSelectCollapsed, setSearchSelectCollapsed] = useState(true)

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
          {sortParams && <SortDropdown {...sortParams} />}
        </div>
      )}
    </div>
  )
}
