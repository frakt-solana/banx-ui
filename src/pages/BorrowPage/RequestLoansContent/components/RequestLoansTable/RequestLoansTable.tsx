import { FC, useCallback } from 'react'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { BorrowNft } from '@banx/api/core'

import { useSelectedNfts } from '../../nftsState'
import { getTableColumns } from './columns'

import styles from './RequestLoansTable.module.less'

interface RequestLoansTableProps {
  nfts: BorrowNft[]
  isLoading: boolean
  requestedLoanValue: number
}

const RequestLoansTable: FC<RequestLoansTableProps> = ({ nfts, isLoading, requestedLoanValue }) => {
  const {
    selection,
    toggle: toggleNftInSelection,
    find: findNftInSelection,
    clear: clearSelection,
    set: setSelection,
  } = useSelectedNfts()

  const hasSelectedNfts = !!selection?.length

  const onSelectAll = useCallback(() => {
    return hasSelectedNfts ? clearSelection() : setSelection(nfts)
  }, [hasSelectedNfts, clearSelection, setSelection, nfts])

  const onRowClick = useCallback(
    (nft: BorrowNft) => toggleNftInSelection(nft),
    [toggleNftInSelection],
  )

  const columns = getTableColumns({
    requestedLoanValue,
    hasSelectedNfts,
    onSelectAll,
    toggleNftInSelection,
    findNftInSelection,
  })

  const showEmptyList = !isLoading && !nfts.length

  return showEmptyList ? (
    <EmptyList message="You don't have NFTs of this collection" />
  ) : (
    <Table
      data={nfts}
      columns={columns}
      rowParams={{ onRowClick }}
      loading={isLoading}
      className={styles.tableRoot}
      classNameTableWrapper={styles.tableWrapper}
    />
  )
}

export default RequestLoansTable
