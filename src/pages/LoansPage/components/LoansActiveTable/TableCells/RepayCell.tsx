import { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan } from '@banx/api/core'
import { useModal } from '@banx/store'

import { useLoansTransactions } from '../hooks'

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

  return (
    <Modal open onCancel={close}>
      <Button onClick={onSubmit}>Repay</Button>
    </Modal>
  )
}
