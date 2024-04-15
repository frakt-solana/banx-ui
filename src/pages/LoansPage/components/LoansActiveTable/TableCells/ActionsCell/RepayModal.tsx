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
  const { repayLoan, repayPartialLoan } = useLoansTransactions()
  const { close } = useModal()

  const initialDebt = calculateLoanRepayValue(loan)

  //? For partial repayment loans, feeAmount is not included in the debt calculation.
  const initialDebtWithoutFee = calculateLoanRepayValue(loan, false)

  const [repaymentPercent, setRepaymentPercent] = useState<number>(100)

  const isFullRepayment = repaymentPercent === 100

  const baseDebtValue = isFullRepayment ? initialDebt : initialDebtWithoutFee
  const paybackValue = (baseDebtValue * repaymentPercent) / 100

  const remainingDebt = initialDebt - paybackValue

  const onSubmit = async () => {
    try {
      trackPageEvent('myloans', `repay`)
      if (isFullRepayment) {
        await repayLoan(loan)
      } else {
        await repayPartialLoan(loan, repaymentPercent * 100)
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
        value={<DisplayValue value={initialDebt} />}
        classNamesProps={{ container: styles.repayModalInfo }}
        flexType="row"
      />
      <Slider
        value={repaymentPercent}
        onChange={setRepaymentPercent}
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
          value={<DisplayValue value={remainingDebt} />}
          flexType="row"
        />
      </div>
      <Button className={styles.repayModalButton} onClick={onSubmit} disabled={!repaymentPercent}>
        Repay <DisplayValue value={paybackValue} />
      </Button>
    </Modal>
  )
}
