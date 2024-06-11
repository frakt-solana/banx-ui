import { FC, useState } from 'react'

import { Button } from '@banx/components/Buttons'
import { Slider } from '@banx/components/Slider'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import { Modal } from '@banx/components/modals/BaseModal'

import { core } from '@banx/api/tokens'
import { useModal } from '@banx/store/common'
import {
  caclulateBorrowTokenLoanValue,
  getColorByPercent,
  isTokenLoanRepaymentCallActive,
} from '@banx/utils'

import { useTokenLoansTransactions } from '../../hooks'

import styles from './ActionsCell.module.less'

interface RepayModalProps {
  loan: core.TokenLoan
}

export const RepayModal: FC<RepayModalProps> = ({ loan }) => {
  const { repayLoan, repayPartialLoan } = useTokenLoansTransactions()
  const { close } = useModal()

  const {
    repaymentCallActive,
    repaymentCallAmount,
    initialRepayPercent,
    debtWithoutFee,
    debtValue,
    roundedRepaymentPercentage,
    unroundedRepaymentPercentage,
  } = calculateRepaymentStaticValues(loan)

  const [repaymentPercent, setRepaymentPercent] = useState<number>(initialRepayPercent)
  const isFullRepayment = repaymentPercent === 100

  const baseDebtValue = isFullRepayment ? debtValue : debtWithoutFee

  //? Check if repaymentPercent equals roundedRepaymentPercentage to handle rounding issues (Uses for repayment call feature)
  const isRoundedRepayment = repaymentPercent === roundedRepaymentPercentage

  const selectedRepaymentPercentage = isRoundedRepayment
    ? unroundedRepaymentPercentage
    : repaymentPercent

  const paybackValue = (baseDebtValue * selectedRepaymentPercentage) / 100

  const remainingDebt = debtValue - paybackValue

  const onSubmit = async () => {
    if (isFullRepayment) {
      return await repayLoan(loan)
    }

    //? If repaymentPercent equals roundedRepaymentPercentage, repay a partial loan with rounded up percentage
    if (isRoundedRepayment) {
      return await repayPartialLoan(loan, Math.ceil(unroundedRepaymentPercentage * 100))
    }

    return await repayPartialLoan(loan, repaymentPercent * 100)
  }

  const colorClassNameByValue = {
    [Math.ceil(initialRepayPercent)]: styles.repayModalSliderYellow,
    100: styles.repayModalSliderGreen,
  }

  return (
    <Modal open onCancel={close}>
      <StatInfo
        label="Debt:"
        value={<DisplayValue value={debtValue} />}
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
            value={<DisplayValue value={repaymentCallAmount} />}
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

const DEFAULT_REPAY_PERCENT = 100

export const calculateRepaymentStaticValues = (loan: core.TokenLoan) => {
  const { bondTradeTransaction } = loan

  const repaymentCallActive = isTokenLoanRepaymentCallActive(loan)
  const repaymentCallAmount = bondTradeTransaction.repaymentCallAmount

  //? For partial repayment loans, feeAmount is not included in the debt calculation
  const debtWithoutFee = caclulateBorrowTokenLoanValue(loan, false).toNumber()
  const debtValue = caclulateBorrowTokenLoanValue(loan).toNumber()

  const unroundedRepaymentPercentage = (repaymentCallAmount / debtWithoutFee) * 100

  //? Round up the repayment percentage to the nearest whole number to ensure all debt is covered when repaying (Uses for repayment call feature)
  const roundedRepaymentPercentage = Math.ceil(unroundedRepaymentPercentage)

  const initialRepayPercent = repaymentCallActive
    ? roundedRepaymentPercentage
    : DEFAULT_REPAY_PERCENT

  return {
    repaymentCallActive,
    debtValue,
    initialRepayPercent,
    debtWithoutFee,
    repaymentCallAmount,
    roundedRepaymentPercentage,
    unroundedRepaymentPercentage,
  }
}
