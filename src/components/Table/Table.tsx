import { ColumnsType } from 'antd/es/table'

import { ViewState, useTableView } from '@banx/store'

import { ActiveRowParams, PartialBreakpoints, SortViewParams } from './types'
import { CardView, SortView, TableView } from './views'

import styles from './Table.module.less'

export interface TableProps<T, P> {
  data: ReadonlyArray<T>
  columns: ColumnsType<T>
  loading: boolean

  sortViewParams?: SortViewParams<P>
  activeRowParams?: ActiveRowParams

  showCard?: boolean
  onRowClick?: (dataItem: T) => void
  breakpoints?: PartialBreakpoints
  className?: string
}

const Table = <T extends object, P extends object>({
  data,
  columns,
  sortViewParams,
  activeRowParams,
  showCard,
  ...props
}: TableProps<T, P>) => {
  const { viewState } = useTableView()

  const ViewComponent = showCard && ViewState.CARD === viewState ? CardView : TableView

  return (
    <div className={styles.container}>
      {sortViewParams && <SortView columns={columns} showCard={showCard} {...sortViewParams} />}
      <ViewComponent data={data} columns={columns} activeRowParams={activeRowParams} {...props} />
    </div>
  )
}

export default Table
