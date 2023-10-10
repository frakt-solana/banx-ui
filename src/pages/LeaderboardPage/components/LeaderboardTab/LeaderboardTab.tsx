import { useEffect } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import EmptyList from '@banx/components/EmptyList'
import { RadioButton } from '@banx/components/RadioButton'
import Table from '@banx/components/Table'

import { useIntersection } from '@banx/hooks'

import { getTableColumns } from './columns'
import { useLeaderboardData } from './hooks'

import styles from './LeaderboardTab.module.less'

const LeaderboardTab = () => {
  const { publicKey: walletPublicKey, connected } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const columns = getTableColumns()

  const { ref: fetchMoreTrigger, inView } = useIntersection()

  const { data, hasNextPage, fetchNextPage, filterParams } = useLeaderboardData()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  return (
    <>
      <RadioButton className={styles.radioButton} {...filterParams} />

      {!connected && (
        <EmptyList className={styles.emptyList} message="Connect wallet to see your position" />
      )}

      <Table
        data={data}
        columns={columns}
        rowKeyField="user"
        className={styles.tableRoot}
        fetchMoreTrigger={fetchMoreTrigger}
        activeRowParams={[
          {
            condition: ({ user }) => user === walletPublicKeyString,
            className: styles.highlightUser,
          },
        ]}
      />
    </>
  )
}

export default LeaderboardTab
