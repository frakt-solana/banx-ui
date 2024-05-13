import { useState } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'
import { SortDropdown, SortDropdownProps } from '@banx/components/SortDropdown'
import Tooltip from '@banx/components/Tooltip'

import { MarketPreview } from '@banx/api/core'
import { Fire } from '@banx/icons'

import { SortField } from '../../hooks'

import styles from './FilterSection.module.less'

interface FilterSectionProps<T> {
  searchSelectParams: SearchSelectProps<T>
  sortParams: SortDropdownProps<SortField>
  onToggleHotFilter: () => void
  isHotFilterActive: boolean
  hotMarkets: MarketPreview[]
}

const FilterSection = <T extends object>({
  searchSelectParams,
  sortParams,
  onToggleHotFilter,
  isHotFilterActive,
  hotMarkets,
}: FilterSectionProps<T>) => {
  const [searchSelectCollapsed, setSearchSelectCollapsed] = useState(true)
  const disabledHotFilterAction = !hotMarkets?.length

  return (
    <div className={styles.container}>
      <div className={styles.filterWrapper}>
        <SearchSelect
          {...searchSelectParams}
          className={styles.searchSelect}
          collapsed={searchSelectCollapsed}
          onChangeCollapsed={setSearchSelectCollapsed}
        />
        <Tooltip
          title={disabledHotFilterAction ? 'No hot collections currently' : 'Hot collections'}
        >
          <>
            <Button
              className={classNames(
                styles.filterButton,
                { [styles.active]: isHotFilterActive },
                { [styles.disabled]: disabledHotFilterAction },
              )}
              onClick={onToggleHotFilter}
              disabled={disabledHotFilterAction}
              variant="secondary"
              type="circle"
            >
              <Fire />
            </Button>
          </>
        </Tooltip>
      </div>
      {searchSelectCollapsed && <SortDropdown {...sortParams} />}
    </div>
  )
}

export default FilterSection
