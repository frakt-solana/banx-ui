import classNames from 'classnames'
import { isEmpty } from 'lodash'

import { ViewState, useTableView } from '@banx/store'

import { Loader } from '../Loader'
import { ActiveRowParams, ColumnType, PartialBreakpoints, SortViewParams } from './types'
import { CardView, SortView, TableView } from './views'

import styles from './Table.module.less'

export interface TableProps<T, P> {
  data: Array<T>
  columns: ColumnType<T>[]
  loading?: boolean
  loadMore?: () => void

  sortViewParams?: SortViewParams<P>
  activeRowParams?: ActiveRowParams<T>[]

  showCard?: boolean
  onRowClick?: (dataItem: T) => void
  breakpoints?: PartialBreakpoints
  className?: string
  classNameTableWrapper?: string
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
  classNameTableWrapper,
  ...props
}: TableProps<T, P>) => {
  const { viewState } = useTableView()

  const ViewComponent = showCard && ViewState.CARD === viewState ? CardView : TableView
  // const ViewComponent = CardView

  const hasData = !isEmpty(data)

  return (
    <>
      {sortViewParams && <SortView columns={columns} showCard={showCard} {...sortViewParams} />}

      {loading && <Loader />}
      {emptyMessage && !loading && <div className={styles.emptyList}>{emptyMessage}</div>}
      <div className={classNames(styles.tableWrapper, classNameTableWrapper)}>
        {hasData && (
          <ViewComponent
            data={data}
            columns={columns}
            activeRowParams={activeRowParams}
            {...props}
          />
        )}
      </div>
    </>
  )
}

export default Table
