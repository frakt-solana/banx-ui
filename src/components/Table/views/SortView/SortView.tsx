import { ReactNode, useState } from 'react'

import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'
import { SortDropdown } from '@banx/components/SortDropdown'
import { Toggle, ToggleProps } from '@banx/components/Toggle'

import { ViewState, useTableView } from '@banx/store'

import { ColumnType,  } from '../../types'
import { SwitchModeButton } from './components'

import styles from './SortView.module.less'

interface SortViewProps<T, P> {
  columns: ColumnType<T>[]
  searchSelectParams: SearchSelectProps<P>
  sortParams?: any // TODO: remove this any type
  toggleParams?: ToggleProps
  showCard?: boolean
  customJSX?: ReactNode
}

export const SortView = <T extends object, P extends object>({
  searchSelectParams,
  sortParams,
  toggleParams,
  showCard,
  customJSX,
}: SortViewProps<T, P>) => {
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
