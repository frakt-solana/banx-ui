import { useCallback, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import EmptyList from '@banx/components/EmptyList'
import { RadioButton } from '@banx/components/RadioButton'
import Table from '@banx/components/Table'

import { user } from '@banx/api/common'

import { getTableColumns } from './columns'
import { TimeRangeSwitcher } from './components'
import { useLeaderboardData } from './hooks'

import styles from './LeaderboardTab.module.less'

const LeaderboardTab = () => {
  const { publicKey: walletPublicKey, connected } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const columns = getTableColumns()

  const {
    data,
    hasNextPage,
    fetchNextPage,
    filterParams,
    timeRangeType,
    onChangeTimeRange,
    isLoading,
  } = useLeaderboardData()

  const loadMore = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, fetchNextPage])

  const rowParams = useMemo(() => {
    return {
      activeRowParams: [
        {
          condition: ({ user }: user.LeaderboardData) => user === walletPublicKeyString,
          className: styles.highlightUser,
        },
      ],
    }
  }, [walletPublicKeyString])

  return (
    <>
      <div className={styles.filtersContainer}>
        <RadioButton className={styles.radioButton} {...filterParams} />
        <TimeRangeSwitcher selectedMode={timeRangeType} onModeChange={onChangeTimeRange} />
        <div className={styles.emptyDiv} />
      </div>
      {!connected && (
        <EmptyList className={styles.emptyList} message="Connect wallet to see your position" />
      )}
      <Table
        data={data}
        columns={columns}
        loading={isLoading}
        className={styles.table}
        loadMore={loadMore}
        rowParams={rowParams}
      />
    </>
  )
}

export default LeaderboardTab
