import { ColumnsType } from 'antd/es/table'
import { isEmpty } from 'lodash'

import { ViewState, useTableView } from '@banx/store'

import { Loader } from '../Loader'
import EmptyList from './EmptyList'
import { ActiveRowParams, PartialBreakpoints, SortViewParams } from './types'
import { CardView, SortView, TableView } from './views'

export interface TableProps<T, P> {
  data: Array<T>
  columns: ColumnsType<T>
  rowKeyField: keyof T
  loading?: boolean

  sortViewParams?: SortViewParams<P>
  activeRowParams?: ActiveRowParams<T>

  showCard?: boolean
  onRowClick?: (dataItem: T) => void
  breakpoints?: PartialBreakpoints
  className?: string
  scrollX?: number
  emptyMessage?: string
}

const Table = <T extends object, P extends object>({
  data,
  columns,
  sortViewParams,
  activeRowParams,
  showCard,
  loading,
  emptyMessage,
  ...props
}: TableProps<T, P>) => {
  const { viewState } = useTableView()

  const ViewComponent = showCard && ViewState.CARD === viewState ? CardView : TableView

  const hasData = !isEmpty(data)

  return (
    <>
      {sortViewParams && <SortView columns={columns} showCard={showCard} {...sortViewParams} />}

      {loading && <Loader />}
      {emptyMessage && !loading && <EmptyList message={emptyMessage} />}

      {hasData && (
        <ViewComponent data={data} columns={columns} activeRowParams={activeRowParams} {...props} />
      )}
    </>
  )
}

export default Table
