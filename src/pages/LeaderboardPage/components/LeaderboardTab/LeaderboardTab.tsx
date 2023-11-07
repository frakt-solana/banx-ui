import { useCallback, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import EmptyList from '@banx/components/EmptyList'
import { RadioButton } from '@banx/components/RadioButton'
import Table from '@banx/components/TableVirtual'

import { LeaderboardData } from '@banx/api/user'

import { getTableColumns } from './columns'
import { useLeaderboardData } from './hooks'

import styles from './LeaderboardTab.module.less'

const LeaderboardTab = () => {
  const { publicKey: walletPublicKey, connected } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const columns = getTableColumns()

  const { data, hasNextPage, fetchNextPage, filterParams, isLoading } = useLeaderboardData()

  const loadMore = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, fetchNextPage])

  const rowParams = useMemo(() => {
    return {
      activeRowParams: [
        {
          condition: ({ user }: LeaderboardData) => user === walletPublicKeyString,
          className: styles.highlightUser,
        },
      ],
    }
  }, [walletPublicKeyString])

  return (
    <>
      <RadioButton className={styles.radioButton} {...filterParams} />
      {!connected && (
        <EmptyList className={styles.emptyList} message="Connect wallet to see your position" />
      )}
      <Table
        data={data}
        columns={columns}
        loading={isLoading}
        className={styles.tableRoot}
        loadMore={loadMore}
        rowParams={rowParams}
      />
    </>
  )
}

export default LeaderboardTab
