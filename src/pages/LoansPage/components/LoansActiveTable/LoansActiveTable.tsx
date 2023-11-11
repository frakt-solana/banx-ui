import { FC, useCallback, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { Loan, Offer } from '@banx/api/core'
import { ViewState, useTableView } from '@banx/store'
import { LoanStatus, determineLoanStatus } from '@banx/utils'

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

  const { sortViewParams, loans, loading, showEmptyList, emptyListParams, showSummary } =
    useLoansActiveTable({
      loans: rawLoans,
      isLoading,
    })

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
          condition: checkIsTerminationLoan,
          className: styles.terminated,
          cardClassName: styles.terminated,
        },
      ],
    }
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

const checkIsTerminationLoan = (loan: Loan) => {
  const loanStatus = determineLoanStatus(loan)
  return loanStatus === LoanStatus.Terminating
}
