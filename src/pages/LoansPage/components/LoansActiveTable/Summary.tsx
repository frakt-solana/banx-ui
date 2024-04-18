import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { every, sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import {
  calcWeeklyFeeWithRepayFee,
  calculateLoanRepayValue,
  isLoanRepaymentCallActive,
} from '@banx/utils'

import { LoanOptimistic } from '../../loansState'
import { calcTotalValueToPay, calcWeightedApr } from './helpers'
import { useLoansTransactions } from './hooks'

import styles from './LoansActiveTable.module.less'

interface SummaryProps {
  loans: Loan[]
  selectedLoans: LoanOptimistic[]
  setSelection: (loans: Loan[], walletPublicKey: string) => void
}

export const Summary: FC<SummaryProps> = ({
  loans,
  selectedLoans: rawSelectedLoans,
  setSelection,
}) => {
  const { publicKey: walletPublicKey } = useWallet()
  const { repayBulkLoan, repayUnpaidLoansInterest } = useLoansTransactions()

  const selectedLoans = useMemo(() => {
    return rawSelectedLoans.map(({ loan }) => loan)
  }, [rawSelectedLoans])

  const totalSelectedLoans = selectedLoans.length
  const totalDebt = sumBy(selectedLoans, calculateLoanRepayValue)
  const totalWeeklyFee = sumBy(selectedLoans, calcWeeklyFeeWithRepayFee)
  const totalValueToPay = sumBy(selectedLoans, calcTotalValueToPay)

  const handleLoanSelection = (value = 0) => {
    setSelection(loans.slice(0, value), walletPublicKey?.toBase58() || '')
  }

  return (
    <div className={styles.summary}>
      <div className={styles.mainStat}>
        <p>{createPercentValueJSX(calcWeightedApr(selectedLoans), '0%')}</p>
        <p>Weighted apr</p>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo
          label="Debt"
          value={<DisplayValue value={totalDebt} />}
          classNamesProps={{ container: styles.debtInterestStat }}
        />
        <StatInfo
          label={getLoansStatusActionText(selectedLoans)}
          value={<DisplayValue value={totalValueToPay} />}
          classNamesProps={{ container: styles.accruedInterestStat }}
        />
        <StatInfo label="Weekly interest" value={<DisplayValue value={totalWeeklyFee} />} />
        <StatInfo
          label="Weighted apr"
          value={calcWeightedApr(selectedLoans)}
          valueType={VALUES_TYPES.PERCENT}
          classNamesProps={{ container: styles.weightedAprStat }}
        />
      </div>
      <div className={styles.summaryControls}>
        <CounterSlider
          label="# Loans"
          value={totalSelectedLoans}
          onChange={(value) => handleLoanSelection(value)}
          rootClassName={styles.slider}
          className={styles.sliderContainer}
          max={loans.length}
        />
        <Button
          className={styles.payButton}
          variant="secondary"
          onClick={repayUnpaidLoansInterest}
          disabled={!totalValueToPay}
        >
          {getLoansStatusActionText(selectedLoans)}
          {<DisplayValue value={totalValueToPay} />}
        </Button>
        <Button
          className={styles.repayButton}
          onClick={repayBulkLoan}
          disabled={!totalSelectedLoans}
        >
          Repay <DisplayValue value={totalDebt} />
        </Button>
      </div>
    </div>
  )
}

const getLoansStatusActionText = (selectedLoans: Loan[]) => {
  const hasSelectedLoans = selectedLoans.length > 0

  const allAreRepaymentCallLoans =
    hasSelectedLoans && every(selectedLoans, isLoanRepaymentCallActive)

  const allAreWithoutRepaymentCallLoans =
    hasSelectedLoans && every(selectedLoans, (loan) => !isLoanRepaymentCallActive(loan))

  if (allAreRepaymentCallLoans) return 'Repayment call'
  if (allAreWithoutRepaymentCallLoans) return 'Pay interest'

  return 'Pay'
}
