import { FC, useState } from 'react'

import { Button } from '@banx/components/Buttons'
import { Slider } from '@banx/components/Slider'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { Loan } from '@banx/api/core'
import { useModal } from '@banx/store'
import {
  calculateLoanRepayValue,
  getColorByPercent,
  isLoanRepaymentCallActive,
  trackPageEvent,
} from '@banx/utils'

import { useLoansTransactions } from '../../hooks'

import styles from './ActionsCell.module.less'

interface RepayModalProps {
  loan: Loan
}

export const RepayModal: FC<RepayModalProps> = ({ loan }) => {
  const { repayLoan, repayPartialLoan } = useLoansTransactions()
  const { close } = useModal()

  const { repaymentCallActive, totalRepayValue, initialRepayPercent, initialRepayValue } =
    calculateRepaymentStaticValues(loan)

  const [repaymentPercent, setRepaymentPercent] = useState<number>(initialRepayPercent)
  const isFullRepayment = repaymentPercent === 100

  const baseDebtValue = isFullRepayment ? totalRepayValue : initialRepayValue
  const paybackValue = (baseDebtValue * repaymentPercent) / 100

  const remainingDebt = totalRepayValue - paybackValue

  const colorClassNameByValue = {
    [Math.ceil(initialRepayPercent)]: styles.repayModalSliderYellow,
    100: styles.repayModalSliderGreen,
  }

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
        value={<DisplayValue value={totalRepayValue} />}
        classNamesProps={{ container: styles.repayModalInfo }}
        flexType="row"
      />
      <Slider
        value={repaymentPercent}
        onChange={setRepaymentPercent}
        className={styles.repayModalSlider}
        rootClassName={getColorByPercent(repaymentPercent, colorClassNameByValue)}
      />
      <div className={styles.repayModalAdditionalInfo}>
        {repaymentCallActive && (
          <StatInfo
            flexType="row"
            label="Repayment call"
            value={<DisplayValue value={loan.bondTradeTransaction.repaymentCallAmount} />}
            classNamesProps={{ label: styles.repayModalRepaymentCall }}
            onClickProps={{
              onLabelClick: () => setRepaymentPercent(initialRepayPercent),
            }}
          />
        )}
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

export const calculateRepaymentStaticValues = (loan: Loan) => {
  const DEFAULT_REPAY_PERCENT = 100

  const repaymentCallActive = isLoanRepaymentCallActive(loan)
  const repaymentCallAmount = loan.bondTradeTransaction.repaymentCallAmount

  const totalRepayValue = calculateLoanRepayValue(loan)

  const repayValueWithoutProtocolFee = calculateLoanRepayValue(loan) //TODO: Need to exclude protocol fee

  const initialRepayPercent =
    Math.ceil(
      repaymentCallActive
        ? (repaymentCallAmount / repayValueWithoutProtocolFee) * 100
        : DEFAULT_REPAY_PERCENT,
    ) + 1

  //? For partial repayment loans, feeAmount is not included in the debt calculation.
  const initialDebtWithoutFee = calculateLoanRepayValue(loan, false)
  const initialRepayValue = repaymentCallActive ? repaymentCallAmount : initialDebtWithoutFee

  return {
    repaymentCallActive,
    totalRepayValue,
    initialRepayPercent,
    initialRepayValue,
  }
}
