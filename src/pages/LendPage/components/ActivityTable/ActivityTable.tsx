import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { FilterTableSection } from './FilterTableSection'
import { getTableColumns } from './columns'
import { useAllLenderActivity } from './hooks'

import styles from './ActivityTable.module.less'

interface ActivityTableProps {
  marketPubkey: string
}

const ActivityTable: FC<ActivityTableProps> = ({ marketPubkey }) => {
  const {
    loans,
    isLoading,
    fetchNextPage,
    hasNextPage,
    filterParams,
    showEmptyList,
    isRadioButtonDisabled,
    isToggleDisabled,
  } = useAllLenderActivity(marketPubkey)

  const { connected } = useWallet()
  const columns = getTableColumns()

  return (
    <>
      <FilterTableSection
        {...filterParams}
        isRadioButtonDisabled={isRadioButtonDisabled}
        isToggleDisabled={isToggleDisabled}
      />
      {!showEmptyList ? (
        <Table
          data={loans}
          columns={columns}
          className={styles.tableRoot}
          loadMore={hasNextPage ? fetchNextPage : undefined}
          classNameTableWrapper={classNames(styles.tableWrapper, {
            [styles.notConnectedTableWrapper]: !connected,
          })}
          loading={isLoading}
          loaderSize="small"
        />
      ) : (
        <EmptyList message="Offers activity should be displayed here, but it's empty yet. Be first lender" />
      )}
    </>
  )
}

export default ActivityTable
