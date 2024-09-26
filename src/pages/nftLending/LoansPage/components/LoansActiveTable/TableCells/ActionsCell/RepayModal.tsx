import { FC, useState } from 'react'

import { Button } from '@banx/components/Buttons'
import { Slider } from '@banx/components/Slider'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import { NumericStepInput } from '@banx/components/inputs'
import { Modal } from '@banx/components/modals/BaseModal'

import { core } from '@banx/api/nft'
import { useModal, useTokenType } from '@banx/store/common'
import {
  calculateLoanRepayValue,
  formatTrailingZeros,
  getColorByPercent,
  getTokenDecimals,
  getTokenUnit,
  isLoanRepaymentCallActive,
} from '@banx/utils'

import { useLoansTransactions } from '../../hooks'

import styles from './ActionsCell.module.less'

interface RepayModalProps {
  loan: core.Loan
}

export const RepayModal: FC<RepayModalProps> = ({ loan }) => {
  const { repayLoan, repayPartialLoan } = useLoansTransactions()
  const { close } = useModal()
  const { tokenType } = useTokenType()

  const {
    repaymentCallActive,
    repaymentCallAmount,
    initialRepayPercent,
    debtWithoutFee,
    debtValue,
    roundedRepaymentPercentage,
    unroundedRepaymentPercentage,
  } = calculateRepaymentStaticValues(loan)

  const marketTokenDecimals = getTokenDecimals(tokenType) //? 1e9, 1e6

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

    //? If repaymentPercent equals roundedRepaymentPercentage, repay a partial loan with rounded up percentage
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
              onLabelClick: () => setRepaymentPercent(initialRepayPercent),
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

const DEFAULT_REPAY_PERCENT = 100

export const calculateRepaymentStaticValues = (loan: core.Loan) => {
  const { bondTradeTransaction } = loan

  const repaymentCallActive = isLoanRepaymentCallActive(loan)
  const repaymentCallAmount = bondTradeTransaction.repaymentCallAmount

  //? For partial repayment loans, feeAmount is not included in the debt calculation
  const debtWithoutFee = calculateLoanRepayValue(loan, false)
  const debtValue = calculateLoanRepayValue(loan)

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

const formatWithMarketDecimals = (value: number, marketDecimals: number, decimalsPlaces = 4) =>
  formatTrailingZeros((value / marketDecimals).toFixed(decimalsPlaces))

const isFullRepayment = (percent: number) => percent === 100
