import { FC, useCallback, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'
import Tooltip from '@banx/components/Tooltip'

import { Loan, Offer } from '@banx/api/core'
import { Call, Warning } from '@banx/icons'
import { ViewState, useTableView } from '@banx/store'
import { isLoanRepaymentCallActive, isLoanTerminating } from '@banx/utils'

import { useSelectedLoans } from '../../loansState'
import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useLoansActiveTable } from './hooks'

import styles from './LoansActiveTable.module.less'

interface LoansActiveTableProps {
  loans: Loan[]
  isLoading: boolean
  offers: Record<string, Offer[]>
}

export const LoansActiveTable: FC<LoansActiveTableProps> = ({
  loans: rawLoans,
  isLoading,
  offers,
}) => {
  const { publicKey: walletPublicKey } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const {
    sortViewParams,
    loans,
    loading,
    showEmptyList,
    emptyListParams,
    showSummary,
    isTerminationFilterEnabled,
    countOfTerminatingLoans,
    toggleTerminationFilter,
    countOfRepaymentCallLoans,
    isRepaymentCallFilterEnabled,
    toggleRepaymentCallFilter,
  } = useLoansActiveTable({ loans: rawLoans, isLoading })

  const {
    selection,
    toggle: toggleLoanInSelection,
    find,
    clear: clearSelection,
    set: setSelection,
  } = useSelectedLoans()

  const walletSelectedLoans = useMemo(() => {
    if (!walletPublicKeyString) return []
    return selection.filter(({ wallet }) => wallet === walletPublicKeyString)
  }, [selection, walletPublicKeyString])

  const hasSelectedLoans = useMemo(() => !!walletSelectedLoans?.length, [walletSelectedLoans])

  const { viewState } = useTableView()

  const onSelectAll = useCallback(() => {
    if (hasSelectedLoans) {
      clearSelection()
    } else {
      setSelection(loans, walletPublicKeyString)
    }
  }, [clearSelection, hasSelectedLoans, loans, setSelection, walletPublicKeyString])

  const findLoanInSelection = useCallback(
    (loanPubkey: string) => {
      return find(loanPubkey, walletPublicKeyString)
    },
    [find, walletPublicKeyString],
  )

  const onRowClick = useCallback(
    (loan: Loan) => {
      toggleLoanInSelection(loan, walletPublicKeyString)
    },
    [toggleLoanInSelection, walletPublicKeyString],
  )

  const columns = getTableColumns({
    onSelectAll,
    findLoanInSelection,
    toggleLoanInSelection: onRowClick,
    hasSelectedLoans,
    isCardView: viewState === ViewState.CARD,
    offers,
  })

  const rowParams = useMemo(() => {
    return {
      onRowClick,
      activeRowParams: [
        {
          condition: isLoanTerminating,
          className: styles.terminated,
          cardClassName: styles.terminated,
        },
        {
          condition: isLoanRepaymentCallActive,
          className: styles.repaymentCallActive,
          cardClassName: styles.repaymentCallActive,
        },
      ],
    }
  }, [onRowClick])

  const customJSX = (
    <div className={styles.filterButtons}>
      <TerminatingFilterButton
        countOfLoans={countOfTerminatingLoans}
        isActive={isTerminationFilterEnabled}
        onClick={toggleTerminationFilter}
      />
      <RepaymentCallFilterButton
        countOfLoans={countOfRepaymentCallLoans}
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
        columns={columns}
        rowParams={rowParams}
        sortViewParams={sortViewParams}
        className={styles.table}
        customJSX={customJSX}
        loading={loading}
        showCard
      />
      {showSummary && (
        <Summary loans={loans} selectedLoans={walletSelectedLoans} setSelection={setSelection} />
      )}
    </div>
  )
}

interface FilterButtonProps {
  onClick: () => void
  isActive: boolean
  countOfLoans: number | null
}

const RepaymentCallFilterButton: FC<FilterButtonProps> = ({ isActive, onClick, countOfLoans }) => (
  <Tooltip title={countOfLoans ? 'Repayment call loans' : 'No repayment call loans currently'}>
    <div
      className={classNames(styles.filterButtonWrapper, styles.repaymentCall)}
      data-count-of-loans={countOfLoans}
    >
      <Button
        className={classNames(
          styles.filterButton,
          { [styles.active]: isActive },
          { [styles.disabled]: !countOfLoans },
        )}
        disabled={!countOfLoans}
        onClick={onClick}
        variant="secondary"
        type="circle"
      >
        <Call />
      </Button>
    </div>
  </Tooltip>
)

const TerminatingFilterButton: FC<FilterButtonProps> = ({ isActive, onClick, countOfLoans }) => (
  <Tooltip title={countOfLoans ? 'Terminating loans' : 'No terminating loans currently'}>
    <div
      className={classNames(styles.filterButtonWrapper, styles.terminating)}
      data-count-of-loans={countOfLoans}
    >
      <Button
        className={classNames(
          styles.filterButton,
          { [styles.active]: isActive },
          { [styles.disabled]: !countOfLoans },
        )}
        disabled={!countOfLoans}
        onClick={onClick}
        variant="secondary"
        type="circle"
      >
        <Warning />
      </Button>
    </div>
  </Tooltip>
)
