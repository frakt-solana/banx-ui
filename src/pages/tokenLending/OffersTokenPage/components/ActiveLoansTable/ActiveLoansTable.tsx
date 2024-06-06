import { useCallback, useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { core } from '@banx/api/tokens'
import { ViewState, useTableView } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
import { isTokenLoanLiquidated, isTokenLoanListed, isTokenLoanTerminating } from '@banx/utils'

import Summary from './Summary'
import { getTableColumns } from './columns'
import { useTokenLoansTable } from './hooks'
import { useSelectedTokenLoans } from './loansState'

import styles from './ActiveLoansTable.module.less'

export const ActiveLoansTable = () => {
  const { tokenType } = useNftTokenType()
  const { publicKey: walletPublicKey } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const { viewState } = useTableView()

  const {
    loans,
    loading,
    hideLoans,
    updateOrAddLoan,
    loansToClaim,
    loansToTerminate,
    sortViewParams,
    showEmptyList,
    emptyMessage,
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

  const rowParams = useMemo(() => {
    return {
      onRowClick,
      activeRowParams: [],
    }
  }, [onRowClick])

  const columns = getTableColumns({
    isCardView: viewState === ViewState.CARD,
    toggleLoanInSelection: onRowClick,
    findLoanInSelection,
    onSelectAll,
    hasSelectedLoans,
  })

  if (showEmptyList) return <EmptyList message={emptyMessage} />

  return (
    <div className={styles.tableRoot}>
      <Table
        data={loans}
        columns={columns}
        rowParams={rowParams}
        sortViewParams={sortViewParams}
        loading={loading}
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
