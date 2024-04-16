import { FC } from 'react'

import { Tab, Tabs, useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan } from '@banx/api/core'
import { useModal } from '@banx/store'

import { ClosureContent, RepaymentCallContent } from './components'

import styles from './ManageModal.module.less'

interface ManageModalProps {
  loan: Loan
}

const ManageModal: FC<ManageModalProps> = ({ loan }) => {
  const { close } = useModal()

  const modalTabs: Tab[] = [
    {
      label: 'Repayment call',
      value: 'repayment',
    },
    {
      label: 'Closure',
      value: 'closure',
    },
  ]

  const defaultTabValue = modalTabs[1].value
  const {
    tabs,
    value: tabValue,
    setValue: setTabValue,
  } = useTabs({
    tabs: modalTabs,
    defaultValue: defaultTabValue,
  })

  return (
    <Modal className={styles.modal} open onCancel={close} width={572}>
      <Tabs className={styles.tabs} tabs={tabs} value={tabValue} setValue={setTabValue} />
      {tabValue === modalTabs[0].value && <RepaymentCallContent loan={loan} close={close} />}
      {tabValue === modalTabs[1].value && <ClosureContent loan={loan} />}
    </Modal>
  )
}

export default ManageModal
