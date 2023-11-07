import { memo } from 'react'

import classNames from 'classnames'
import { isEmpty } from 'lodash'

import { ViewState, useTableView } from '@banx/store'

import { Loader } from '../Loader'
import { ColumnType, SortViewParams, TableRowParams } from './types'
import { CardView, SortView, TableView } from './views'

import styles from './Table.module.less'

export interface TableProps<T, P> {
  data: Array<T>
  columns: ColumnType<T>[]
  loading?: boolean
  loadMore?: () => void

  sortViewParams?: SortViewParams<P>
  rowParams?: TableRowParams<T> //? Must be wrapped in useMemo because of render virtual table specific

  showCard?: boolean
  className?: string
  classNameTableWrapper?: string
  emptyMessage?: string
}

const Table = <T extends object, P extends object>({
  data,
  columns,
  sortViewParams,
  rowParams,
  showCard,
  loading,
  emptyMessage,
  className,
  classNameTableWrapper,
  loadMore,
}: TableProps<T, P>) => {
  const { viewState } = useTableView()

  const ViewComponent = showCard && ViewState.CARD === viewState ? CardView : TableView

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
            rowParams={rowParams}
            className={className}
            loadMore={loadMore}
          />
        )}
      </div>
    </>
  )
}

export default memo(Table) as typeof Table
