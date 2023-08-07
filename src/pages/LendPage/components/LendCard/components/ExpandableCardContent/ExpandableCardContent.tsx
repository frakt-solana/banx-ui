import { Tabs } from '@banx/components/Tabs'

import { useExpandableCardContent } from './hooks'

import styles from './ExpandableCardContent.module.less'

const ExpandableCardContent = () => {
  const { tabsParams } = useExpandableCardContent()

  return (
    <div className={styles.content}>
      <Tabs {...tabsParams} />
    </div>
  )
}

export default ExpandableCardContent
