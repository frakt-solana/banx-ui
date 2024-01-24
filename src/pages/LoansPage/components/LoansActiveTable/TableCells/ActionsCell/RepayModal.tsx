import { FC, useState } from 'react'

import { Button } from '@banx/components/Buttons'
import { Slider } from '@banx/components/Slider'
import { StatInfo } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan } from '@banx/api/core'
import { useModal } from '@banx/store'
import { calculateLoanRepayValue, getColorByPercent, trackPageEvent } from '@banx/utils'

import { useLoansTransactions } from '../../hooks'

import styles from './ActionsCell.module.less'

interface RepayModalProps {
  loan: Loan
}

export const RepayModal: FC<RepayModalProps> = ({ loan }) => {
  const { close } = useModal()

  const { repaymentCallExists, totalRepayValue, initialRepayPercent, initialRepayValue } =
    calculateRepaymentStaticValues(loan)

  const { repayLoan, repayPartialLoan } = useLoansTransactions()

  const [partialPercent, setPartialPercent] = useState<number>(initialRepayPercent)
  const [paybackValue, setPaybackValue] = useState<number>(initialRepayValue)

  const onPartialPercentChange = (percentValue: number) => {
    setPartialPercent(percentValue)
    setPaybackValue((totalRepayValue * percentValue) / 100)
  }

  const remainingValue = totalRepayValue - paybackValue

  const colorClassNameByValue = {
    [Math.ceil(initialRepayPercent)]: styles.repayModalSliderYellow,
    100: styles.repayModalSliderGreen,
  }

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
      <Slider
        value={partialPercent}
        onChange={onPartialPercentChange}
        className={styles.repayModalSlider}
        rootClassName={getColorByPercent(partialPercent, colorClassNameByValue)}
      />
      <div className={styles.repayModalAdditionalInfo}>
        {repaymentCallExists && (
          <StatInfo
            flexType="row"
            label="Repayment call"
            value={loan.repaymentCall?.callAmount || 0}
            divider={1e9}
            classNamesProps={{ label: styles.repayModalRepaymentCall }}
            onClickProps={{
              onLabelClick: () => onPartialPercentChange(initialRepayPercent),
            }}
          />
        )}
        <StatInfo flexType="row" label="Repay value" value={paybackValue} divider={1e9} />
        <StatInfo flexType="row" label="Remaining debt" value={remainingValue} divider={1e9} />
      </div>
      <Button className={styles.repayModalButton} onClick={onSubmit} disabled={!partialPercent}>
        Repay {createSolValueJSX(paybackValue, 1e9, '0◎')}
      </Button>
    </Modal>
  )
}

export const calculateRepaymentStaticValues = (loan: Loan) => {
  const repaymentCallExists = !!loan.repaymentCall?.callAmount

  const totalRepayValue = calculateLoanRepayValue(loan)

  const DEFAULT_REPAY_PERCENT = 100
  const initialRepayPercent = repaymentCallExists
    ? ((loan.repaymentCall?.callAmount || 0) / totalRepayValue) * 100
    : DEFAULT_REPAY_PERCENT

  const initialRepayValue = repaymentCallExists
    ? loan.repaymentCall?.callAmount || 0
    : totalRepayValue * (initialRepayPercent / 100)

  return {
    repaymentCallExists,
    totalRepayValue,
    initialRepayPercent,
    initialRepayValue,
  }
}
