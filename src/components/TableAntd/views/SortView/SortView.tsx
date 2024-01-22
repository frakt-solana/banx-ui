import { useState } from 'react'

import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'
import { SortDropdown, SortDropdownProps } from '@banx/components/SortDropdown'
import { Toggle, ToggleProps } from '@banx/components/Toggle'

import { ViewState, useTableView } from '@banx/store'

import { SwitchModeButtons } from './components'

import styles from './SortView.module.less'

interface SortViewProps<P> {
  searchSelectParams: SearchSelectProps<P>
  sortParams?: SortDropdownProps
  toggleParams?: ToggleProps
  showCard?: boolean
}

const SortView = <P extends object>({
  searchSelectParams,
  sortParams,
  toggleParams,
  showCard,
}: SortViewProps<P>) => {
  const { viewState, setViewState } = useTableView()
  const [searchSelectCollapsed, setSearchSelectCollapsed] = useState(true)

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
          {sortParams && <SortDropdown {...sortParams} />}
        </div>
      )}
    </div>
  )
}

export default SortView
