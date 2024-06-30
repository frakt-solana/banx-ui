import { FC, useCallback, useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'
import Tooltip from '@banx/components/Tooltip'

import { core } from '@banx/api/nft'
import { Coin, Warning } from '@banx/icons'
import { ViewState, useTableView } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
import { isLoanRepaymentCallActive, isLoanTerminating } from '@banx/utils'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useLoansActiveTable } from './hooks'
import { useSelectedLoans } from './loansState'

import styles from './LoansActiveTable.module.less'

interface LoansActiveTableProps {
  loans: core.Loan[]
  isLoading: boolean
  offers: Record<string, core.Offer[]>
}

export const LoansActiveTable: FC<LoansActiveTableProps> = ({
  loans: rawLoans,
  isLoading,
  offers,
}) => {
  const { tokenType } = useNftTokenType()

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
    terminatingLoansAmount,
    toggleTerminationFilter,
    repaymentCallsAmount,
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

  //? Clear selection when tokenType changes
  //? To prevent selection transfering from one tokenType to another
  useEffect(() => {
    clearSelection()
  }, [clearSelection, tokenType])

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
    (loan: core.Loan) => {
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

  if (showEmptyList) return <EmptyList className={styles.emptyList} {...emptyListParams} />

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
