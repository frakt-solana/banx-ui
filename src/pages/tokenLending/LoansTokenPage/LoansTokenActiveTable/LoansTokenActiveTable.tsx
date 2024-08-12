import { FC, useCallback, useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'
import Tooltip from '@banx/components/Tooltip'

import { core } from '@banx/api/tokens'
import { Coin, Warning } from '@banx/icons'
import { ViewState, useTableView } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
import { isTokenLoanRepaymentCallActive, isTokenLoanTerminating } from '@banx/utils'

import Summary from './Summary'
import { getTableColumns } from './columns'
import { useLoansTokenActiveTable } from './hooks'
import { useSelectedTokenLoans } from './loansState'

import styles from './LoansTokenActiveTable.module.less'

interface LoansTokenActiveTableProps {
  loans: core.TokenLoan[]
  isLoading: boolean
}

const LoansTokenActiveTable: FC<LoansTokenActiveTableProps> = ({ loans: rawLoans, isLoading }) => {
  const { tokenType } = useNftTokenType()

  const { publicKey: walletPublicKey } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const {
    loans,
    loading,
    terminatingLoansAmount,
    repaymentCallsAmount,
    isTerminationFilterEnabled,
    isRepaymentCallFilterEnabled,
    toggleTerminationFilter,
    toggleRepaymentCallFilter,
    showSummary,
    showEmptyList,
    sortViewParams,
    emptyListParams,
  } = useLoansTokenActiveTable({ loans: rawLoans, isLoading })

  const {
    selection,
    toggle: toggleLoanInSelection,
    find,
    clear: clearSelection,
    set: setSelection,
  } = useSelectedTokenLoans()

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
    (loan: core.TokenLoan) => {
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
  })

  const rowParams = useMemo(() => {
    return {
      onRowClick,
      activeRowParams: [
        {
          condition: isTokenLoanTerminating,
          className: styles.terminated,
          cardClassName: styles.terminated,
        },
        {
          condition: isTokenLoanRepaymentCallActive,
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
