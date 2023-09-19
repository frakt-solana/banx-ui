type RenderDOMFunc = (triggerNode: HTMLElement) => HTMLElement

export const getPopupContainer: RenderDOMFunc = (triggerNode) => {
  if (triggerNode.parentNode instanceof HTMLElement) {
    return triggerNode.parentNode
  }
  return document.body
}
