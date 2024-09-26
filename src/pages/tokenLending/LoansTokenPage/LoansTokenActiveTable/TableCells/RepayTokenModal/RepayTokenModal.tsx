import { FC, useState } from 'react'

import { Button } from '@banx/components/Buttons'
import { Slider } from '@banx/components/Slider'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import { NumericStepInput } from '@banx/components/inputs'
import { Modal } from '@banx/components/modals/BaseModal'

import { core } from '@banx/api/tokens'
import { useModal, useTokenType } from '@banx/store/common'
import {
  caclulateBorrowTokenLoanValue,
  getColorByPercent,
  getTokenDecimals,
  getTokenUnit,
  isTokenLoanRepaymentCallActive,
} from '@banx/utils'

import { useTokenLoansTransactions } from '../../hooks'
import { formatWithMarketDecimals, isFullRepayment } from './helpers'

import styles from './RepayTokenModal.module.less'

interface RepayTokenModallProps {
  loan: core.TokenLoan
}

const RepayTokenModal: FC<RepayTokenModallProps> = ({ loan }) => {
  const { repayLoan, repayPartialLoan } = useTokenLoansTransactions()
  const { close } = useModal()
  const { tokenType } = useTokenType()

  const marketTokenDecimals = getTokenDecimals(tokenType) //? 1e9, 1e6

  const {
    repaymentCallActive,
    repaymentCallAmount,
    initialRepayPercent,
    debtWithoutFee,
    debtValue,
    roundedRepaymentPercentage,
    unroundedRepaymentPercentage,
  } = calculateRepaymentStaticValues(loan)

  const initialPaybackValue = formatWithMarketDecimals(debtValue, marketTokenDecimals)

  const [repaymentPercent, setRepaymentPercent] = useState<number>(initialRepayPercent)
  const [paybackValueInput, setPaybackValueInput] = useState<string>(initialPaybackValue)

  const isRoundedRepayment = repaymentPercent === roundedRepaymentPercentage

  //? Calculate base debt depending on whether it's full or partial repayment
  const calculateBaseDebt = (percent: number) =>
    isFullRepayment(percent) ? debtValue : debtWithoutFee

  const calculatePaybackValue = (baseDebt: number, percent: number) => (baseDebt * percent) / 100

  const baseDebtValue = calculateBaseDebt(repaymentPercent)
  const selectedRepaymentPercentage = isRoundedRepayment
    ? unroundedRepaymentPercentage
    : repaymentPercent

  const paybackValue = calculatePaybackValue(baseDebtValue, selectedRepaymentPercentage)
  const remainingDebt = debtValue - paybackValue

  const handleSliderChange = (percent: number) => {
    const baseDebtValue = calculateBaseDebt(percent)
    setRepaymentPercent(percent)

    const newPaybackValue = calculatePaybackValue(baseDebtValue, percent)
    setPaybackValueInput(formatWithMarketDecimals(newPaybackValue, marketTokenDecimals))
  }

  const handleInputChange = (value: string) => {
    const parsedValue = parseFloat(value) * marketTokenDecimals

    if (isNaN(parsedValue) || !parsedValue) {
      setRepaymentPercent(0)
    }

    const newRepaymentPercent = (parsedValue / baseDebtValue) * 100
    setRepaymentPercent(Math.min(newRepaymentPercent, 100))
    setPaybackValueInput(value)
  }

  const onSubmit = async () => {
    if (isFullRepayment(repaymentPercent)) {
      return await repayLoan(loan)
    }

    const fractionToRepay = isRoundedRepayment
      ? Math.ceil(unroundedRepaymentPercentage * 100)
      : repaymentPercent * 100

    return await repayPartialLoan(loan, fractionToRepay)
  }

  const colorClassNameByValue = {
    [Math.ceil(initialRepayPercent)]: styles.repayModalSliderYellow,
    100: styles.repayModalSliderGreen,
  }

  return (
    <Modal open onCancel={close}>
      <NumericStepInput
        label="Repay value"
        value={paybackValueInput}
        onChange={handleInputChange}
        postfix={getTokenUnit(tokenType)}
      />

      <Slider
        value={repaymentPercent}
        onChange={handleSliderChange}
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
              onLabelClick: () => handleSliderChange(initialRepayPercent),
            }}
          />
        )}
        <StatInfo label="Total debt" value={<DisplayValue value={debtValue} />} flexType="row" />
        <StatInfo
          label="Debt after repayment"
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

export default RepayTokenModal

const DEFAULT_REPAY_PERCENT = 100

const calculateRepaymentStaticValues = (loan: core.TokenLoan) => {
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
