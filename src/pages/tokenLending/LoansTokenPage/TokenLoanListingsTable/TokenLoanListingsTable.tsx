import { useCallback, useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import Table from '@banx/components/Table'

import { TokenLoan } from '@banx/api/tokens'
import { ViewState, useTableView, useTokenType } from '@banx/store/common'

import { getTableColumns } from './columns'
import { useUserTokenLoanListings } from './hooks'
import { useSelectTokenLoans } from './loansState'

import styles from './TokenLoanListingsTable.module.less'

const TokenLoanListingsTable = () => {
  const { loans, isLoading } = useUserTokenLoanListings()

  const { publicKey } = useWallet()
  const walletPubkey = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()
  const { viewState } = useTableView()

  const {
    selection,
    toggle: toggleLoanInSelection,
    find,
    clear: clearSelection,
    set: setSelection,
  } = useSelectTokenLoans()

  //? Clear selection when tokenType changes
  //? To prevent selection transfering from one tokenType to another
  useEffect(() => {
    clearSelection()
  }, [clearSelection, tokenType])

  const walletSelectedLoans = useMemo(() => {
    if (!walletPubkey) return []
    return selection.filter(({ wallet }) => wallet === walletPubkey)
  }, [selection, walletPubkey])

  const hasSelectedLoans = !!walletSelectedLoans?.length

  const onSelectAll = useCallback(() => {
    if (hasSelectedLoans) {
      clearSelection()
    } else {
      setSelection(loans, walletPubkey)
    }
  }, [clearSelection, hasSelectedLoans, loans, setSelection, walletPubkey])

  const findLoanInSelection = useCallback(
    (loanPubkey: string) => find(loanPubkey, walletPubkey),
    [find, walletPubkey],
  )

  const onRowClick = useCallback(
    (loan: TokenLoan) => toggleLoanInSelection(loan, walletPubkey),
    [toggleLoanInSelection, walletPubkey],
  )

  const rowParams = useMemo(() => {
    return { onRowClick }
  }, [onRowClick])

  const columns = getTableColumns({
    onSelectAll,
    findLoanInSelection,
    toggleLoanInSelection: onRowClick,
    hasSelectedLoans,
    isCardView: viewState === ViewState.CARD,
  })

  return (
    <div className={styles.tableRoot}>
      <Table
        data={loans}
        columns={columns}
        rowParams={rowParams}
        className={styles.table}
        loading={isLoading}
        showCard
      />
    </div>
  )
}

export default TokenLoanListingsTable
