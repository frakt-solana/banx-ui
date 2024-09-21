import { FC } from 'react'

import { Tab, Tabs, useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import { core } from '@banx/api/tokens'
import { useModal } from '@banx/store/common'

import { ClosureContent } from './ClosureContent'
import { RepaymentCallContent } from './RepaymentCallContent'

import styles from './ManageModal.module.less'

interface ManageModalProps {
  loan: core.TokenLoan
}

const ManageModal: FC<ManageModalProps> = ({ loan }) => {
  const { close } = useModal()

  const { value: currentTabValue, ...tabProps } = useTabs({
    tabs: TABS,
    defaultValue: TabName.CLOSURE,
  })

  return (
    <Modal className={styles.modal} open onCancel={close} width={572}>
      <Tabs className={styles.tabs} value={currentTabValue} {...tabProps} />
      {currentTabValue === TabName.REPAYMENT && <RepaymentCallContent loan={loan} />}
      {currentTabValue === TabName.CLOSURE && <ClosureContent loan={loan} />}
    </Modal>
  )
}

export default ManageModal

enum TabName {
  REPAYMENT = 'repayment',
  CLOSURE = 'closure',
}

const TABS: Tab[] = [
  {
    label: 'Repayment call',
    value: TabName.REPAYMENT,
  },
  {
    label: 'Closure',
    value: TabName.CLOSURE,
  },
]
