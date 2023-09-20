import { Dispatch, SetStateAction } from 'react'

import { ColumnsType } from 'antd/es/table'
import classNames from 'classnames'
import { isEmpty } from 'lodash'

import { ViewState, useTableView } from '@banx/store'

import { Loader } from '../Loader'
import { SCROLL_THRESHOLD_HEIGHT } from './constants'
import { ActiveRowParams, PartialBreakpoints, SortViewParams } from './types'
import { CardView, SortView, TableView } from './views'

import styles from './Table.module.less'

export interface TableProps<T, P> {
  data: Array<T>
  columns: ColumnsType<T>
  rowKeyField: keyof T
  loading?: boolean

  sortViewParams?: SortViewParams<P>
  activeRowParams?: ActiveRowParams<T>[]

  showCard?: boolean
  onRowClick?: (dataItem: T) => void
  breakpoints?: PartialBreakpoints
  className?: string
  classNameTableWrapper?: string
  fetchMoreTrigger?: Dispatch<SetStateAction<Element | null>>
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
  fetchMoreTrigger,
  ...props
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
            activeRowParams={activeRowParams}
            {...props}
          />
        )}
        {fetchMoreTrigger && (
          <div style={{ height: SCROLL_THRESHOLD_HEIGHT }} ref={fetchMoreTrigger} />
        )}
      </div>
    </>
  )
}

export default Table
