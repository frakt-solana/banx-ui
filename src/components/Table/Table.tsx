import { memo } from 'react'

import classNames from 'classnames'
import { isEmpty } from 'lodash'

import { ViewState, useTableView } from '@banx/store/common'

import { Loader } from '../Loader'
import { TableProps } from './types'
import { CardView, SortView, TableView } from './views'

import styles from './Table.module.less'

const Table = <DataType extends object, SearchType extends object, SortType>({
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
  customJSX,
  loaderSize,
  loaderClassName,
}: TableProps<DataType, SearchType, SortType>) => {
  const { viewState } = useTableView()

  const ViewComponent = showCard && ViewState.CARD === viewState ? CardView : TableView

  const hasData = !isEmpty(data)

  return (
    <>
      {sortViewParams && (
        <SortView columns={columns} showCard={showCard} customJSX={customJSX} {...sortViewParams} />
      )}

      {loading && <Loader className={loaderClassName} size={loaderSize} />}
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
