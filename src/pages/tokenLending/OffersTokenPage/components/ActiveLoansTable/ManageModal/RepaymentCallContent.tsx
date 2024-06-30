import { FC, useState } from 'react'

import { Button } from '@banx/components/Buttons'
import { Slider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import { HealthColorIncreasing, getColorByPercent, getTokenDecimals } from '@banx/utils'

import { useTokenLenderLoansTransactions } from '../hooks'
import { calculateRepaymentStaticValues } from './helpers'

import styles from './ManageModal.module.less'

export const RepaymentCallContent: FC<{ loan: core.TokenLoan }> = ({ loan }) => {
  const { sendRepaymentCall } = useTokenLenderLoansTransactions()

  const { repaymentCallActive, totalClaim, initialRepayPercent, initialRepayValue } =
    calculateRepaymentStaticValues(loan)

  const [repayPercent, setRepayPercent] = useState<number>(initialRepayPercent)
  const [paybackValue, setPaybackValue] = useState<number>(initialRepayValue)

  const onPartialPercentChange = (percentValue: number) => {
    setRepayPercent(percentValue)
    setPaybackValue(Math.floor((totalClaim * percentValue) / 100))
  }

  const remainingDebt = totalClaim - paybackValue

  const tokenDecimals = getTokenDecimals(loan.bondTradeTransaction.lendingToken)
  const collateralSupply = loan.fraktBond.fbondTokenSupply / Math.pow(10, loan.collateral.decimals)

  const ltvRatio = remainingDebt / tokenDecimals / collateralSupply
  const ltvPercent = (ltvRatio / loan.collateralPrice) * 100

  const sendBtnDisabled =
    !repayPercent || (repaymentCallActive && initialRepayValue === paybackValue)

  return (
    <div className={styles.modalContent}>
      <Slider
        value={repayPercent}
        onChange={onPartialPercentChange}
        marks={DEFAULT_SLIDER_MARKS}
        max={MAX_SLIDER_VALUE}
      />
      <div className={styles.repaimentCallAdditionalInfo}>
        <StatInfo
          label="Ask borrower to repay"
          value={<DisplayValue value={paybackValue} />}
          flexType="row"
        />
        <StatInfo
          label="Debt after repayment"
          value={<DisplayValue value={remainingDebt} />}
          flexType="row"
        />
        <StatInfo
          label="Ltv after repayment"
          value={ltvPercent}
          valueStyles={{ color: getColorByPercent(ltvPercent, HealthColorIncreasing) }}
          valueType={VALUES_TYPES.PERCENT}
          flexType="row"
        />
      </div>
      <Button
        className={styles.repaymentCallButton}
        onClick={() => sendRepaymentCall(loan, repayPercent)}
        disabled={sendBtnDisabled}
      >
        {!repaymentCallActive ? 'Send' : 'Update'}
      </Button>
    </div>
  )
}

const MAX_SLIDER_VALUE = 90
const DEFAULT_SLIDER_MARKS = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  90: '90%',
}
