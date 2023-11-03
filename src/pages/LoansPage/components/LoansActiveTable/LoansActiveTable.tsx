import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { Loan } from '@banx/api/core'
import { useFakeInfinityScroll } from '@banx/hooks'
import { ViewState, useTableView } from '@banx/store'
import { LoanStatus, determineLoanStatus } from '@banx/utils'

import { useSelectedLoans } from '../../loansState'
import { Summary } from './Summary'
import { getTableColumns } from './columns'
import { useLoansActiveTable } from './hooks'

import styles from './LoansActiveTable.module.less'

export const LoansActiveTable = () => {
  const { publicKey: walletPublicKey } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const { sortViewParams, loans, loading, showEmptyList, emptyListParams, showSummary } =
    useLoansActiveTable()

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

  const { viewState } = useTableView()

  const onSelectAll = (): void => {
    if (hasSelectedLoans) {
      clearSelection()
    } else {
      setSelection(loans, walletPublicKeyString)
    }
  }

  const findLoanInSelection = (loanPubkey: string) => {
    return find(loanPubkey, walletPublicKeyString)
  }

  const onRowClick = (loan: Loan) => {
    toggleLoanInSelection(loan, walletPublicKeyString)
  }

  const columns = getTableColumns({
    onSelectAll,
    findLoanInSelection,
    toggleLoanInSelection: onRowClick,
    hasSelectedLoans,
    isCardView: viewState === ViewState.CARD,
  })

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: loans })

  if (showEmptyList) return <EmptyList {...emptyListParams} />

  return (
    <div className={styles.tableRoot}>
      <Table
        data={data}
        columns={columns}
        onRowClick={onRowClick}
        sortViewParams={sortViewParams}
        className={styles.table}
        rowKeyField="publicKey"
        loading={loading}
        showCard
        activeRowParams={[
          {
            condition: checkIsTerminationLoan,
            className: styles.terminated,
            cardClassName: styles.terminated,
          },
        ]}
      />
      <div ref={fetchMoreTrigger} />
      {showSummary && (
        <Summary loans={loans} selectedLoans={walletSelectedLoans} setSelection={setSelection} />
      )}
    </div>
  )
}

const checkIsTerminationLoan = (loan: Loan) => {
  const loanStatus = determineLoanStatus(loan)
  return loanStatus === LoanStatus.Terminating
}
