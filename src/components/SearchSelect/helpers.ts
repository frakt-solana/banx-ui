import { DefaultOptionType } from 'antd/lib/select'
import { isString } from 'lodash'

export const filterOption = (input: string, option?: DefaultOptionType): boolean => {
  if (option?.label && isString(option.label)) {
    return option.label.toLowerCase().includes(input.toLowerCase())
  }
  return false
}

type RenderDOMFunc = (triggerNode: HTMLElement) => HTMLElement

export const getPopupContainer: RenderDOMFunc = (triggerNode) => {
  if (triggerNode.parentNode instanceof HTMLElement) {
    return triggerNode.parentNode
  }
  return document.body
}
