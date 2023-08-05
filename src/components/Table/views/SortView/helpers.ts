import { ColumnGroupType } from 'antd/lib/table'
import { isFunction } from 'lodash'

export const parseTableColumn = <T>(column: any) => {
  const { key, title } = column

  const label = isFunction(title) ? title(null)?.props.label : title
  const value = String(key)

  return { value, label }
}
