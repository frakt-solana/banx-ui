import { useCallback, useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'
import Tooltip from '@banx/components/Tooltip'

import { core } from '@banx/api/nft'
import { Underwater } from '@banx/icons'
import { isLoanAbleToTerminate } from '@banx/pages/nftLending/OffersPage'
import { ViewState, useTableView } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
import {
  isLoanLiquidated,
  isLoanListed,
  isLoanRepaymentCallActive,
  isLoanTerminating,
  isUnderWaterLoan,
} from '@banx/utils'

import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useLoansTable } from './hooks'
import { useSelectedLoans } from './loansState'

import styles from './LoansTable.module.less'

export const LoansTable = () => {
  const { tokenType } = useNftTokenType()
  const { publicKey: walletPublicKey } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const {
    loans,
    sortViewParams,
    hideLoans,
    updateOrAddLoan,
    loading,
    showEmptyList,
    emptyMessage,
    isUnderwaterFilterActive,
    onToggleUnderwaterFilter,
    underwaterLoansCount,
    loansToClaim,
    loansToTerminate,
  } = useLoansTable()

  const { viewState } = useTableView()

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
    (loan: core.Loan) => {
      if (!isLoanAbleToTerminate(loan) || isLoanListed(loan)) return
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
          condition: (loan: core.Loan) => isLoanTerminating(loan),
          className: styles.terminated,
          cardClassName: styles.terminated,
        },
        {
          condition: (loan: core.Loan) => isLoanLiquidated(loan),
          className: styles.liquidated,
          cardClassName: styles.liquidated,
        },
        {
          condition: (loan: core.Loan) =>
            isUnderWaterLoan(loan) && !isLoanRepaymentCallActive(loan),
          className: styles.underwater,
          cardClassName: styles.underwater,
        },
        {
          condition: (loan: core.Loan) => isLoanRepaymentCallActive(loan),
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
        updateOrAddLoan={updateOrAddLoan}
        selectedLoans={walletSelectedLoans}
        setSelection={setSelection}
        hideLoans={hideLoans}
      />
    </div>
  )
}
