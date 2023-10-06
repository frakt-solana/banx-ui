import { FC, useState } from 'react'

import { Button } from '@banx/components/Buttons'
import { Slider } from '@banx/components/Slider'
import { StatInfo } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan } from '@banx/api/core'
import { useModal } from '@banx/store'
import { calculateLoanRepayValue } from '@banx/utils'

import { useLoansTransactions } from '../../hooks'

import styles from './ActionsCell.module.less'

interface RepayModalProps {
  loan: Loan
}

export const RepayModal: FC<RepayModalProps> = ({ loan }) => {
  const { close } = useModal()

  const { repayLoan, repayPartialLoan } = useLoansTransactions()

  const initialRepayValue = calculateLoanRepayValue(loan)

  const [partialPercent, setPartialPercent] = useState<number>(100)
  const [paybackValue, setPaybackValue] = useState<number>(initialRepayValue)

  const onPartialPercentChange = (percentValue: number) => {
    setPartialPercent(percentValue)
    setPaybackValue((initialRepayValue * percentValue) / 100)
  }

  const remainingValue = initialRepayValue - paybackValue

  const onSubmit = async () => {
    try {
      if (partialPercent === 100) {
        await repayLoan(loan)
      } else {
        await repayPartialLoan(loan, partialPercent * 100)
      }
    } catch (error) {
      console.error(error)
    } finally {
      close()
    }
  }

  return (
    <Modal open onCancel={close}>
      <StatInfo
        flexType="row"
        label="Debt:"
        value={initialRepayValue}
        divider={1e9}
        classNamesProps={{ container: styles.repayModalInfo }}
      />
      <Slider value={partialPercent} onChange={onPartialPercentChange} />
      <div className={styles.repayModalAdditionalInfo}>
        <StatInfo flexType="row" label="Repay value" value={paybackValue} divider={1e9} />
        <StatInfo flexType="row" label="Remaining debt" value={remainingValue} divider={1e9} />
      </div>
      <Button className={styles.repayModalButton} onClick={onSubmit} disabled={!partialPercent}>
        Repay {createSolValueJSX(paybackValue, 1e9, '0◎')}
      </Button>
    </Modal>
  )
}
