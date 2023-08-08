import { useTabs } from '@banx/components/Tabs'

import { BONDS_TABS } from './constants'

export const useExpandableCardContent = () => {
  const {
    tabs: bondTabs,
    value: tabValue,
    setValue: setTabValue,
  } = useTabs({
    tabs: BONDS_TABS,
    defaultValue: BONDS_TABS[0].value,
  })

  return {
    tabsParams: {
      tabs: bondTabs,
      value: tabValue,
      setValue: setTabValue,
    },
  }
}
