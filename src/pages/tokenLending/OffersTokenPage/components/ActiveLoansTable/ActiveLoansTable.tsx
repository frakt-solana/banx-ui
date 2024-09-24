import { useCallback, useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'
import Tooltip from '@banx/components/Tooltip'

import { core } from '@banx/api/tokens'
import { Underwater } from '@banx/icons'
import { ViewState, useTableView, useTokenType } from '@banx/store/common'
import {
  isTokenLoanLiquidated,
  isTokenLoanListed,
  isTokenLoanRepaymentCallActive,
  isTokenLoanTerminating,
  isTokenLoanUnderWater,
} from '@banx/utils'

import Summary from './Summary'
import { getTableColumns } from './columns'
import { useTokenLoansTable } from './hooks'
import { useSelectedTokenLoans } from './loansState'

import styles from './ActiveLoansTable.module.less'

export const ActiveLoansTable = () => {
  const { tokenType } = useTokenType()
  const { publicKey: walletPublicKey } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const { viewState } = useTableView()

  const {
    loans,
    loading,
    loansToClaim,
    loansToTerminate,
    sortViewParams,
    showEmptyList,
    emptyMessage,
    isUnderwaterFilterActive,
    onToggleUnderwaterFilter,
    underwaterLoansCount,
  } = useTokenLoansTable()

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
    return selection
      .filter(({ wallet }) => wallet === walletPublicKeyString)
      .map(({ loan }) => loan)
  }, [selection, walletPublicKeyString])

  const hasSelectedLoans = useMemo(() => !!walletSelectedLoans?.length, [walletSelectedLoans])

  const onSelectAll = useCallback(() => {
    return hasSelectedLoans
      ? clearSelection()
      : setSelection(loansToTerminate, walletPublicKeyString)
  }, [hasSelectedLoans, clearSelection, setSelection, loansToTerminate, walletPublicKeyString])

  const findLoanInSelection = useCallback(
    (loanPubkey: string) => {
      return find(loanPubkey, walletPublicKeyString)
    },
    [find, walletPublicKeyString],
  )

  const onRowClick = useCallback(
    (loan: core.TokenLoan) => {
      const canSelect =
        !isTokenLoanLiquidated(loan) && !isTokenLoanTerminating(loan) && !isTokenLoanListed(loan)

      if (!canSelect) return
      toggleLoanInSelection(loan, walletPublicKeyString)
    },
    [toggleLoanInSelection, walletPublicKeyString],
  )

  const columns = getTableColumns({
    isCardView: viewState === ViewState.CARD,
    toggleLoanInSelection: onRowClick,
    findLoanInSelection,
    onSelectAll,
    hasSelectedLoans,
  })

  const rowParams = useMemo(() => {
    return {
      onRowClick,
      activeRowParams: [
        {
          condition: (loan: core.TokenLoan) => isTokenLoanTerminating(loan),
          className: styles.terminated,
          cardClassName: styles.terminated,
        },
        {
          condition: (loan: core.TokenLoan) => isTokenLoanLiquidated(loan),
          className: styles.liquidated,
          cardClassName: styles.liquidated,
        },
        {
          condition: (loan: core.TokenLoan) =>
            isTokenLoanUnderWater(loan) && !isTokenLoanRepaymentCallActive(loan),
          className: styles.underwater,
          cardClassName: styles.underwater,
        },
        {
          condition: (loan: core.TokenLoan) => isTokenLoanRepaymentCallActive(loan),
          className: styles.activeRepaymentCall,
          cardClassName: styles.activeRepaymentCall,
        },
      ],
    }
  }, [onRowClick])

  const customJSX = (
    <Tooltip title={underwaterLoansCount ? 'Underwater loans' : 'No underwater loans currently'}>
      <div className={styles.filterButtonWrapper} data-underwater-loans={underwaterLoansCount}>
        <Button
          className={classNames(
            styles.filterButton,
            { [styles.active]: isUnderwaterFilterActive },
            { [styles.disabled]: !underwaterLoansCount },
          )}
          disabled={!underwaterLoansCount}
          onClick={onToggleUnderwaterFilter}
          type="circle"
          variant="secondary"
        >
          <Underwater />
        </Button>
      </div>
    </Tooltip>
  )

  if (showEmptyList) return <EmptyList message={emptyMessage} />

  return (
    <div className={styles.tableRoot}>
      <Table
        data={loans}
        columns={columns}
        rowParams={rowParams}
        sortViewParams={sortViewParams}
        loading={loading}
        customJSX={customJSX}
        className={styles.table}
        showCard
      />
      <Summary
        loansToClaim={loansToClaim}
        loansToTerminate={loansToTerminate}
        selectedLoans={walletSelectedLoans}
        setSelection={setSelection}
      />
    </div>
  )
}
