import { DefaultOptionType } from 'antd/lib/select'
import { isString } from 'lodash'

export const filterOption = (input: string, option?: DefaultOptionType): boolean => {
  if (option?.label && isString(option.label)) {
    return option.label.toLowerCase().includes(input.toLowerCase())
  }
  return false
}

export const getPopupContainer = (triggerNode: any) => {
  return triggerNode.parentNode
}
