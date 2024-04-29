import { useCallback, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { Loan } from '@banx/api/core'
import { ViewState, useTableView } from '@banx/store'

import { useBorrowerLoansRequests } from '../../hooks'
import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useRequestsLoansTable } from './hooks'
import { useSelectedLoans } from './loansState'

import styles from './RequestLoansTable.module.less'

export const RequestsTable = () => {
  const { loans: rawLoans, isLoading } = useBorrowerLoansRequests()

  const { publicKey: walletPublicKey } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const { viewState } = useTableView()

  const { sortViewParams, loans, loading, showEmptyList, emptyListParams, showSummary } =
    useRequestsLoansTable({ loans: rawLoans, isLoading })

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

  const hasSelectedLoans = !!walletSelectedLoans?.length

  const onSelectAll = useCallback(() => {
    if (hasSelectedLoans) {
      clearSelection()
    } else {
      setSelection(loans, walletPublicKeyString)
    }
  }, [clearSelection, hasSelectedLoans, loans, setSelection, walletPublicKeyString])

  const findLoanInSelection = useCallback(
    (loanPubkey: string) => find(loanPubkey, walletPublicKeyString),
    [find, walletPublicKeyString],
  )

  const onRowClick = useCallback(
    (loan: Loan) => toggleLoanInSelection(loan, walletPublicKeyString),
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
    return { onRowClick }
  }, [onRowClick])

  if (showEmptyList) return <EmptyList {...emptyListParams} />

  return (
    <div className={styles.tableRoot}>
      <Table
        data={loans}
        columns={columns}
        rowParams={rowParams}
        sortViewParams={sortViewParams}
        className={styles.table}
        loading={loading}
        showCard
      />
      {showSummary && (
        <Summary loans={loans} selectedLoans={walletSelectedLoans} setSelection={setSelection} />
      )}
    </div>
  )
}
