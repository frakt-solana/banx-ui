import { FC, useState } from 'react'

import { Button } from '@banx/components/Buttons'
import { Slider } from '@banx/components/Slider'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan } from '@banx/api/core'
import { useModal } from '@banx/store'

import { useLoansTransactions } from '../hooks'

import styles from '../LoansActiveTable.module.less'

interface RepayCellProps {
  loan: Loan
  isCardView: boolean
}

export const RepayCell: FC<RepayCellProps> = ({ loan, isCardView }) => {
  const { open } = useModal()

  const openModal = () => {
    open(RepayModal, { loan })
  }

  return (
    <>
      <Button
        size={isCardView ? 'large' : 'small'}
        onClick={(event) => {
          openModal()
          event.stopPropagation()
        }}
      >
        Repay
      </Button>
    </>
  )
}

interface RepayModalProps {
  loan: Loan
}

const RepayModal: FC<RepayModalProps> = ({ loan }) => {
  const { close } = useModal()

  const { repayLoan } = useLoansTransactions()

  const onSubmit = () => {}

  const [partialPercent, setPartialPercent] = useState(100)

  const onPartialPercentChange = (nextValue: number) => {
    setPartialPercent(nextValue)
  }

  return (
    <Modal open onCancel={close}>
      <Slider value={partialPercent} onChange={onPartialPercentChange} />
      <Button className={styles.repayButton} onClick={onSubmit}>
        Repay
      </Button>
    </Modal>
  )
}
