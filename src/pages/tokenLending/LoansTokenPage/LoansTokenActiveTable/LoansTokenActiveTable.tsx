import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'
import Tooltip from '@banx/components/Tooltip'

import { core } from '@banx/api/tokens'
import { Coin, Warning } from '@banx/icons'

import { useLoansTokenActiveTable } from './hooks'

import styles from './LoansTokenActiveTable.module.less'

interface LoansTokenActiveTableProps {
  loans: core.TokenLoan[]
  isLoading: boolean
}

const LoansTokenActiveTable: FC<LoansTokenActiveTableProps> = ({ loans: rawLoans, isLoading }) => {
  const {
    loans,
    loading,
    terminatingLoansAmount,
    repaymentCallsAmount,
    isTerminationFilterEnabled,
    isRepaymentCallFilterEnabled,
    toggleTerminationFilter,
    toggleRepaymentCallFilter,
    showEmptyList,
    sortViewParams,
    emptyListParams,
  } = useLoansTokenActiveTable({ loans: rawLoans, isLoading })

  const customJSX = (
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
  )

  if (showEmptyList) return <EmptyList {...emptyListParams} />

  return (
    <div className={styles.tableRoot}>
      <Table
        data={loans}
        columns={[]}
        rowParams={{}}
        sortViewParams={sortViewParams}
        className={styles.table}
        customJSX={customJSX}
        loading={loading}
      />
    </div>
  )
}

export default LoansTokenActiveTable

interface FilterButtonProps {
  onClick: () => void
  isActive: boolean
  loansAmount: number | null
}

const RepaymentCallFilterButton: FC<FilterButtonProps> = ({ isActive, onClick, loansAmount }) => (
  <Tooltip title={loansAmount ? 'Repayment calls' : 'No repayment calls currently'}>
    <div
      className={classNames(styles.filterButtonWrapper, styles.repaymentCall)}
      data-loans-amount={loansAmount}
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
      data-loans-amount={loansAmount}
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
