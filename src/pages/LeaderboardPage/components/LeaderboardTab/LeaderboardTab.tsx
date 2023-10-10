// import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

import EmptyList from '@banx/components/EmptyList'
import { RadioButton } from '@banx/components/RadioButton'
import Table from '@banx/components/Table'

import { useIntersection } from '@banx/hooks'

import { getTableColumns } from './columns'
import { useLeaderboardData } from './hooks'
import sadPepeImg from './sad_pepe.png'

import styles from './LeaderboardTab.module.less'

const LeaderboardTab = () => {
  const { publicKey: walletPublicKey, connected } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const columns = getTableColumns()

  const { ref: fetchMoreTrigger /* inView */ } = useIntersection()

  const { data, /* hasNextPage, fetchNextPage, */ filterParams, isLoading } = useLeaderboardData()

  // useEffect(() => {
  //   if (inView && hasNextPage) {
  //     fetchNextPage()
  //   }
  // }, [inView, hasNextPage, fetchNextPage])

  return (
    <div className={styles.container}>
      <Plug />
      <RadioButton className={styles.radioButton} {...filterParams} />
      {!connected && (
        <EmptyList className={styles.emptyList} message="Connect wallet to see your position" />
      )}

      <Table
        data={data}
        columns={columns}
        loading={isLoading}
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
    </div>
  )
}

export default LeaderboardTab

const Plug = () => (
  <div className={styles.plugContainer}>
    <img className={styles.plugImage} src={sadPepeImg} alt="Money Pepe" />
    <div className={styles.plugTextContainer}>
      <span>🔥 Points for leaderboard S2 are already accumulating in the background</span>
      <span>
        🔥 In just a few days you will be able to see all the points you have already accumulated
        for S2
      </span>
    </div>
  </div>
)
