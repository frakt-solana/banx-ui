import { FC } from 'react'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { FilterTableSection } from './FilterTableSection'
import { getTableColumns } from './columns'
import { useAllLenderActivity } from './hooks'

import styles from './ActivityTable.module.less'

interface ActivityTableProps {
  marketPubkey: string
  goToPlaceOfferTab: () => void
}

const ActivityTable: FC<ActivityTableProps> = ({ marketPubkey, goToPlaceOfferTab }) => {
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
          classNameTableWrapper={styles.tableWrapper}
          loadMore={hasNextPage ? fetchNextPage : undefined}
          loading={isLoading}
        />
      ) : (
        <EmptyList
          message="Offers activity should be displayed here, but it's empty yet. Be first lender"
          buttonProps={{
            onClick: goToPlaceOfferTab,
            text: 'Lend SOL',
          }}
        />
      )}
    </>
  )
}

export default ActivityTable
