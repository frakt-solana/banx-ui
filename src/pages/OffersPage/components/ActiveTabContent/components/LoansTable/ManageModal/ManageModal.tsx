import { FC } from 'react'

import { Tab, Tabs, useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import { core } from '@banx/api/nft'
import { useModal } from '@banx/store/common'

import { ClosureContent, RepaymentCallContent } from './components'

import styles from './ManageModal.module.less'

interface ManageModalProps {
  loan: core.Loan
}

const ManageModal: FC<ManageModalProps> = ({ loan }) => {
  const { close } = useModal()

  const { value: currentTabValue, ...tabProps } = useTabs({
    tabs: TABS,
    defaultValue: TABS[1].value,
  })

  return (
    <Modal className={styles.modal} open onCancel={close} width={572}>
      <Tabs className={styles.tabs} value={currentTabValue} {...tabProps} />
      {currentTabValue === TabName.REPAYMENT && <RepaymentCallContent loan={loan} close={close} />}
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
