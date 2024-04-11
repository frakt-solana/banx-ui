import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calcWeeklyFeeWithRepayFee, calculateLoanRepayValue } from '@banx/utils'

import { LoanOptimistic } from '../../loansState'
import { caclFractionToRepay, calcWeightedApr, calculateUnpaidInterest } from './helpers'
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
  const totalUnpaidInterest = sumBy(selectedLoans, calculateUnpaidInterest)

  const loansWithCalculatedUnpaidInterest = useMemo(() => {
    return selectedLoans
      .map((loan) => ({ loan, fractionToRepay: caclFractionToRepay(loan) }))
      .filter(({ fractionToRepay }) => fractionToRepay > 0)
  }, [selectedLoans])

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
          label="Accrued interest"
          value={<DisplayValue value={totalUnpaidInterest} />}
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
          variant="secondary"
          onClick={() => repayUnpaidLoansInterest(loansWithCalculatedUnpaidInterest)}
          disabled={!totalUnpaidInterest}
        >
          Pay interest {<DisplayValue value={totalUnpaidInterest} />}
        </Button>
        <Button onClick={repayBulkLoan} disabled={!totalSelectedLoans}>
          Repay <DisplayValue value={totalDebt} />
        </Button>
      </div>
    </div>
  )
}
