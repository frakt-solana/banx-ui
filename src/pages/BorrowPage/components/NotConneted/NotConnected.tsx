import React from 'react'

import Table from '@banx/components/Table'

import { useFakeInfinityScroll } from '@banx/hooks'

import { getTableColumns } from './columns'
import { useNotConnectedBorrow } from './hooks'

const NotConnected = () => {
  const { marketsPreview, sortViewParams, isLoading } = useNotConnectedBorrow()

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: marketsPreview })

  const columns = getTableColumns()
  return (
    <>
      <Table
        data={data}
        columns={columns}
        sortViewParams={sortViewParams}
        rowKeyField="marketPubkey"
        loading={isLoading}
        showCard
      />
      <div ref={fetchMoreTrigger} />
    </>
  )
}

export default NotConnected
