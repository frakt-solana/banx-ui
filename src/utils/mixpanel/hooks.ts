import { useEffect } from 'react'

import { debounce } from 'lodash'

import { trackPageEvent } from './core'
import { PAGE_NAMES } from './types'

const trackPageDebounced = debounce(trackPageEvent, 1000)

export const useMixpanelLocationTrack = (pageName: `${PAGE_NAMES}`) => {
  useEffect(() => {
    trackPageDebounced(pageName, 'start')
  }, [pageName])
}
