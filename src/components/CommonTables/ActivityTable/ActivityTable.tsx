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
  hideToggle?: boolean
  classNamesProps?: {
    wrapper?: string
    table?: string
  }
}

const ActivityTable: FC<ActivityTableProps> = ({
  marketPubkey,
  classNamesProps,
  hideToggle = false,
}) => {
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
        hideToggle={hideToggle}
      />
      {!showEmptyList ? (
        <Table
          data={loans}
          columns={columns}
          className={classNames(styles.tableRoot, classNamesProps?.table)}
          loadMore={hasNextPage ? fetchNextPage : undefined}
          classNameTableWrapper={classNames(styles.tableWrapper, classNamesProps?.wrapper, {
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
