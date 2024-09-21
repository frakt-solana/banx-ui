import { useWallet } from '@solana/wallet-adapter-react'

import Table from '@banx/components/Table'

import { useNftTokenType } from '@banx/store/nft'

import { getTableColumns } from './columns'
import { EMPTY_MESSAGE, NOT_CONNECTED_MESSAGE } from './constants'
import { useNotConnectedBorrow } from './hooks'

import styles from './NotConnectedTable.module.less'

const NotConnectedTable = () => {
  const { connected } = useWallet()
  const { marketsPreview, sortViewParams, isLoading } = useNotConnectedBorrow()
  const { tokenType } = useNftTokenType()

  const columns = getTableColumns()

  const emptyMessage = connected ? EMPTY_MESSAGE : NOT_CONNECTED_MESSAGE[tokenType]

  return (
    <Table
      data={marketsPreview}
      columns={columns}
      sortViewParams={sortViewParams}
      loading={isLoading}
      emptyMessage={emptyMessage}
      className={styles.borrowTable}
      showCard
    />
  )
}

export default NotConnectedTable
