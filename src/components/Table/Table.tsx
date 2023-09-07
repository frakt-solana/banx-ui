import { ColumnsType } from 'antd/es/table'
import { isEmpty } from 'lodash'

import { ViewState, useTableView } from '@banx/store'

import { Loader } from '../Loader'
import { ActiveRowParams, PartialBreakpoints, SortViewParams } from './types'
import { CardView, SortView, TableView } from './views'

export interface TableProps<T, P> {
  data: Array<T>
  columns: ColumnsType<T>
  rowKeyField: keyof T
  loading?: boolean

  sortViewParams?: SortViewParams<P>
  activeRowParams?: ActiveRowParams

  showCard?: boolean
  onRowClick?: (dataItem: T) => void
  breakpoints?: PartialBreakpoints
  className?: string
  scrollX?: number
}

const Table = <T extends object, P extends object>({
  data,
  columns,
  sortViewParams,
  activeRowParams,
  showCard,
  loading,
  ...props
}: TableProps<T, P>) => {
  const { viewState } = useTableView()

  const ViewComponent = showCard && ViewState.CARD === viewState ? CardView : TableView

  const noData = isEmpty(data) && !loading
  const hasData = !isEmpty(data)

  return (
    <>
      {sortViewParams && <SortView columns={columns} showCard={showCard} {...sortViewParams} />}

      {loading && <Loader />}
      {noData && <>Items not found</>}

      {hasData && (
        <ViewComponent data={data} columns={columns} activeRowParams={activeRowParams} {...props} />
      )}
    </>
  )
}

export default Table
