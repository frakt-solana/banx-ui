import { FC, useEffect } from 'react'

import EmptyList from '@banx/components/EmptyList'
import Table from '@banx/components/Table'

import { useIntersection } from '@banx/hooks'

import { FilterTableSection } from './FilterTableSection'
import { getTableColumns } from './columns'
import { useAllLenderActivity } from './hooks'

import styles from './ActivityTable.module.less'

interface ActivityTableProps {
  marketPubkey: string
  goToPlaceOfferTab: () => void
}

const ActivityTable: FC<ActivityTableProps> = ({ marketPubkey, goToPlaceOfferTab }) => {
  const { ref: fetchMoreTrigger, inView } = useIntersection()

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

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

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
          rowKeyField="id"
          className={styles.tableRoot}
          classNameTableWrapper={styles.tableWrapper}
          fetchMoreTrigger={fetchMoreTrigger}
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
