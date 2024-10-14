import { FC, useState } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'
import { SortDropdown, SortDropdownProps } from '@banx/components/SortDropdown'
import Tooltip from '@banx/components/Tooltip'

import { Coin, Warning } from '@banx/icons'

import { SortField } from '../types'

import styles from '../TokenLoansContent.module.less'

interface FilterSectionProps<T> {
  searchSelectParams: SearchSelectProps<T>
  sortParams: SortDropdownProps<SortField>

  terminatingLoansAmount: number
  repaymentCallsAmount: number

  isTerminationFilterEnabled: boolean
  toggleTerminationFilter: () => void

  isRepaymentCallFilterEnabled: boolean
  toggleRepaymentCallFilter: () => void
}

export const FilterSection = <T extends object>({
  searchSelectParams,
  sortParams,
  terminatingLoansAmount,
  repaymentCallsAmount,
  isTerminationFilterEnabled,
  toggleTerminationFilter,
  isRepaymentCallFilterEnabled,
  toggleRepaymentCallFilter,
}: FilterSectionProps<T>) => {
  const [searchSelectCollapsed, setSearchSelectCollapsed] = useState(true)

  return (
    <div className={styles.container}>
      <div className={styles.filterContent}>
        <SearchSelect
          {...searchSelectParams}
          className={styles.searchSelect}
          collapsed={searchSelectCollapsed}
          onChangeCollapsed={setSearchSelectCollapsed}
          disabled={!searchSelectParams.options.length}
        />

        <div className={styles.filterButtons}>
          <TerminatingFilterButton
            loansAmount={terminatingLoansAmount}
            isActive={isTerminationFilterEnabled}
            onClick={toggleTerminationFilter}
          />
          <RepaymentCallFilterButton
            loansAmount={repaymentCallsAmount}
            isActive={isRepaymentCallFilterEnabled}
            onClick={toggleRepaymentCallFilter}
          />
        </div>
      </div>

      <SortDropdown
        {...sortParams}
        className={!searchSelectCollapsed ? styles.dropdownHidden : ''}
      />
    </div>
  )
}

interface FilterButtonProps {
  onClick: () => void
  isActive: boolean
  loansAmount: number | null
}

const RepaymentCallFilterButton: FC<FilterButtonProps> = ({ isActive, onClick, loansAmount }) => (
  <Tooltip title={loansAmount ? 'Repayment calls' : 'No repayment calls currently'}>
    <div
      className={classNames(styles.filterButtonWrapper, styles.repaymentCall)}
      data-loans-amount={loansAmount && loansAmount > 0 ? loansAmount : null}
    >
      <Button
        className={classNames(
          styles.repaymentCallFilterButton,
          { [styles.active]: isActive },
          { [styles.disabled]: !loansAmount },
        )}
        disabled={!loansAmount}
        onClick={onClick}
        variant="secondary"
        type="circle"
      >
        <Coin />
      </Button>
    </div>
  </Tooltip>
)

const TerminatingFilterButton: FC<FilterButtonProps> = ({ isActive, onClick, loansAmount }) => (
  <Tooltip title={loansAmount ? 'Terminating loans' : 'No terminating loans currently'}>
    <div
      className={classNames(styles.filterButtonWrapper, styles.terminating)}
      data-loans-amount={loansAmount && loansAmount > 0 ? loansAmount : null}
    >
      <Button
        className={classNames(
          styles.terminatingFilterButton,
          { [styles.active]: isActive },
          { [styles.disabled]: !loansAmount },
        )}
        disabled={!loansAmount}
        onClick={onClick}
        variant="secondary"
        type="circle"
      >
        <Warning />
      </Button>
    </div>
  </Tooltip>
)
