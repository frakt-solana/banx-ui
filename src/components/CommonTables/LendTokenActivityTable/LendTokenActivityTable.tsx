import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import Table from '@banx/components/Table'

import { getTableColumns } from './columns'
import { FilterTableSection } from './components'
import { useLendTokenActivity } from './hooks'

import styles from './LendTokenActivityTable.module.less'

interface LendTokenActivityTableProps {
  marketPubkey: string
}

const LendTokenActivityTable: FC<LendTokenActivityTableProps> = ({ marketPubkey }) => {
  const {
    loans,
    isLoading,
    fetchNextPage,
    hasNextPage,
    filterParams,
    showEmptyList,
    isRadioButtonDisabled,
    isToggleDisabled,
  } = useLendTokenActivity(marketPubkey)

  const { connected } = useWallet()

  const columns = getTableColumns()

  return (
    <>
      <FilterTableSection
        {...filterParams}
        isRadioButtonDisabled={isRadioButtonDisabled}
        isToggleDisabled={isToggleDisabled}
      />
      <Table
        data={loans}
        columns={columns}
        className={styles.tableRoot}
        loading={isLoading}
        loadMore={hasNextPage ? fetchNextPage : undefined}
        loaderSize="small"
        classNameTableWrapper={classNames(styles.tableWrapper, {
          [styles.notConnectedContent]: !connected,
        })}
        emptyMessage={
          showEmptyList
            ? 'Offers activity should be displayed here, but it"s empty yet. Be first lender'
            : ''
        }
      />
    </>
  )
}

export default LendTokenActivityTable
