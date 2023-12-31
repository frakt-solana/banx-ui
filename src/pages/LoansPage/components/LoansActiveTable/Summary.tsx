import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue } from '@banx/utils'

import { LoanOptimistic } from '../../loansState'
import { useLoansTransactions } from './hooks'

import styles from './LoansActiveTable.module.less'

interface SummaryProps {
  loans: Loan[]
  selectedLoans: LoanOptimistic[]
  setSelection: (loans: Loan[], walletPublicKey: string) => void
}

export const Summary: FC<SummaryProps> = ({ loans, selectedLoans, setSelection }) => {
  const { publicKey: walletPublicKey } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const { repayBulkLoan } = useLoansTransactions()

  const totalSelectedLoans = selectedLoans.length

  const totalDebt = sumBy(selectedLoans, ({ loan }) => calculateLoanRepayValue(loan))

  const totalBorrowed = sumBy(selectedLoans, ({ loan }) => {
    const { fraktBond, totalRepaidAmount = 0 } = loan
    return fraktBond.borrowedAmount - totalRepaidAmount
  })

  const handleLoanSelection = (value = 0) => {
    setSelection(loans.slice(0, value), walletPublicKeyString)
  }

  return (
    <div className={styles.summary}>
      <div className={styles.collaterals}>
        <p className={styles.collateralsTitle}>{totalSelectedLoans}</p>
        <p className={styles.collateralsSubtitle}>Nfts selected</p>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Principal" value={totalBorrowed} divider={1e9} />
        <StatInfo label="Debt" value={totalDebt} divider={1e9} />
      </div>
      <div className={styles.summaryControls}>
        <CounterSlider
          label="# Loans"
          value={totalSelectedLoans}
          onChange={(value) => handleLoanSelection(value)}
          rootClassName={styles.slider}
          max={loans.length}
        />
        <Button onClick={repayBulkLoan} disabled={!totalSelectedLoans}>
          Repay {createSolValueJSX(totalDebt, 1e9, '0◎')}
        </Button>
      </div>
    </div>
  )
}
