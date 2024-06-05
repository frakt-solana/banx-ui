import { useCallback, useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import Table from '@banx/components/Table'

import { core } from '@banx/api/tokens'
import { ViewState, useTableView } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
import { isTokenLoanListed } from '@banx/utils'

import { getTableColumns } from './columns'
import { useTokenLoansTable } from './hooks'
import { useSelectedTokenLoans } from './loansState'

import styles from './ActiveLoansTable.module.less'

export const ActiveLoansTable = () => {
  const { tokenType } = useNftTokenType()
  const { publicKey: walletPublicKey } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const { viewState } = useTableView()

  const { loans, loading, sortViewParams } = useTokenLoansTable()

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
    return hasSelectedLoans ? clearSelection() : setSelection([], walletPublicKeyString)
  }, [hasSelectedLoans, clearSelection, setSelection, walletPublicKeyString])

  const findLoanInSelection = useCallback(
    (loanPubkey: string) => {
      return find(loanPubkey, walletPublicKeyString)
    },
    [find, walletPublicKeyString],
  )

  const onRowClick = useCallback(
    (loan: core.TokenLoan) => {
      if (!isTokenLoanListed(loan)) return
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
    </div>
  )
}
