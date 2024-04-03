import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { Tab, useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import { PriorityLevel, getHumanReadablePriorityLevel, usePriorityFees } from '@banx/store'

import styles from './PriorityFeesModal.module.less'

type PriorityFeesModalProps = {
  onCancel: () => void
}

export const PriorityFeesModal: FC<PriorityFeesModalProps> = ({ onCancel }) => {
  const { priorityLevel, setPriorityLevel } = usePriorityFees()

  const {
    value: currentTabValue,
    tabs,
    setValue: onTabClick,
  } = useTabs({
    tabs: PRIORITY_TYPED_TABS,
    defaultValue:
      PRIORITY_TYPED_TABS.find(({ value }) => value === priorityLevel)?.value ??
      PRIORITY_TYPED_TABS[0].value,
  })

  const onSaveChanges = () => {
    setPriorityLevel(currentTabValue as PriorityLevel)
    onCancel()
  }

  return (
    <Modal open centered onCancel={onCancel} maskClosable={false} width={500} footer={false}>
      <h2 className={styles.title}>Priority mode</h2>
      {/* //TODO Move styles into tabs component with specific type */}
      <div className={styles.tabs}>
        {tabs.map(({ label, value: tabValue, disabled }) => {
          const isActive = tabValue === currentTabValue

          return (
            <button
              key={tabValue}
              className={classNames(styles.tab, { [styles.tabActive]: isActive })}
              name={tabValue}
              onClick={() => {
                onTabClick(tabValue)
              }}
              disabled={disabled}
            >
              {label}
            </button>
          )
        })}
      </div>

      <Button className={styles.saveButton} onClick={onSaveChanges}>
        Save changes
      </Button>
    </Modal>
  )
}

const PRIORITY_TYPED_TABS: Tab[] = Object.values(PriorityLevel).map((priorityLevel) => ({
  label: getHumanReadablePriorityLevel(priorityLevel),
  value: priorityLevel,
}))
