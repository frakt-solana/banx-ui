import { FC, useState } from 'react'

import { Button } from '@banx/components/Buttons'
import { Slider } from '@banx/components/Slider'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan } from '@banx/api/core'
import { useModal } from '@banx/store'
import { calculateLoanRepayValue, trackPageEvent } from '@banx/utils'

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
      trackPageEvent('myloans', `repay`)
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
        label="Debt:"
        value={<DisplayValue value={initialRepayValue} />}
        classNamesProps={{ container: styles.repayModalInfo }}
        flexType="row"
      />
      <Slider
        value={partialPercent}
        onChange={onPartialPercentChange}
        className={styles.repayModalSlider}
      />
      <div className={styles.repayModalAdditionalInfo}>
        <StatInfo
          label="Repay value"
          value={<DisplayValue value={paybackValue} />}
          flexType="row"
        />
        <StatInfo
          label="Remaining debt"
          value={<DisplayValue value={remainingValue} />}
          flexType="row"
        />
      </div>
      <Button className={styles.repayModalButton} onClick={onSubmit} disabled={!partialPercent}>
        Repay <DisplayValue value={paybackValue} />
      </Button>
    </Modal>
  )
}
