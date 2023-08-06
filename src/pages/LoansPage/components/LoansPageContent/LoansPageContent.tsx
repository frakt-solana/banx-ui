import { FC } from 'react'

import { Tabs, useTabs } from '@banx/components/Tabs'

import { LOANS_TABS, LoansTabsNames } from '../../constants'
import LoansActiveTab from '../LoansActiveTab'

import styles from './LoansPageContent.module.less'

const LoansPageContent: FC = () => {
  const {
    tabs: marketTabs,
    value: tabValue,
    setValue: setTabValue,
  } = useTabs({ tabs: LOANS_TABS, defaultValue: LOANS_TABS[0].value })

  return (
    <div className={styles.content}>
      <Tabs className={styles.tabs} tabs={marketTabs} value={tabValue} setValue={setTabValue} />
      <div className={styles.tabContent}>
        {tabValue === LoansTabsNames.ACTIVE && <LoansActiveTab />}
      </div>
    </div>
  )
}

export default LoansPageContent
