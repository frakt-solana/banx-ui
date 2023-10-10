import mixpanel from 'mixpanel-browser'

import { IS_DEVELOPMENT, MIXPANEL_ACCESS_TOKEN } from '@banx/constants'

import { PAGE_NAMES } from './types'

mixpanel.init(MIXPANEL_ACCESS_TOKEN)
mixpanel.set_config({ persistence: 'localStorage' })

export const trackEvent = (eventName: string, eventProps?: Record<string, unknown>) => {
  // console.log(eventName, eventProps)
  if (!IS_DEVELOPMENT) mixpanel.track(eventName, eventProps ?? undefined)
}

export const trackNavigationEvent = (eventName: string) => {
  trackEvent(`navigation-${eventName}`)
}

export const trackPageEvent = (pageName: `${PAGE_NAMES}`, eventName: string) => {
  trackEvent(`${pageName}-${eventName}`)
}
