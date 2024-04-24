import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calcWeeklyFeeWithRepayFee } from '@banx/utils'

import { calcWeightedApr } from '../LoansActiveTable/helpers'
import { LoanOptimistic } from '../LoansActiveTable/loansState'
import { useRequestLoansTransactions } from './hooks'

import styles from './RequestLoansTable.module.less'

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

  const { delistAll } = useRequestLoansTransactions()

  const selectedLoans = useMemo(() => {
    return rawSelectedLoans.map(({ loan }) => loan)
  }, [rawSelectedLoans])

  const totalSelectedLoans = selectedLoans.length
  const totalBorrow = sumBy(selectedLoans, (loan) => loan.fraktBond.borrowedAmount)
  const totalWeeklyFee = sumBy(selectedLoans, calcWeeklyFeeWithRepayFee)

  const handleLoanSelection = (value = 0) => {
    setSelection(loans.slice(0, value), walletPublicKey?.toBase58() || '')
  }

  const weightedApr = calcWeightedApr(selectedLoans)

  return (
    <div className={styles.summary}>
      <div className={styles.mainStat}>
        <p>{createPercentValueJSX(weightedApr, '0%')}</p>
        <p>Weighted apr</p>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo
          label="Weighted apr"
          value={weightedApr}
          valueType={VALUES_TYPES.PERCENT}
          classNamesProps={{ container: styles.weightedAprStat }}
        />
        <StatInfo label="Borrow" value={<DisplayValue value={totalBorrow} />} />
        <StatInfo label="Weekly interest" value={<DisplayValue value={totalWeeklyFee} />} />
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
        <Button onClick={delistAll} disabled={!totalSelectedLoans}>
          Delist
        </Button>
      </div>
    </div>
  )
}
