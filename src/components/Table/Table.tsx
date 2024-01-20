import { memo } from 'react'

import classNames from 'classnames'
import { isEmpty } from 'lodash'

import { ViewState, useTableView } from '@banx/store'

import { Loader } from '../Loader'
import { TableProps } from './types'
import { CardView, SortView, TableView } from './views'

import styles from './Table.module.less'

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
  styleTableWrapper,
  customJSX,
}: TableProps<T, P>) => {
  const { viewState } = useTableView()

  const ViewComponent = showCard && ViewState.CARD === viewState ? CardView : TableView

  const hasData = !isEmpty(data)

  return (
    <>
      {sortViewParams && (
        <SortView columns={columns} showCard={showCard} customJSX={customJSX} {...sortViewParams} />
      )}

      {loading && <Loader />}
      {emptyMessage && !loading && <div className={styles.emptyList}>{emptyMessage}</div>}
      <div
        style={styleTableWrapper}
        className={classNames(styles.tableWrapper, classNameTableWrapper)}
      >
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
