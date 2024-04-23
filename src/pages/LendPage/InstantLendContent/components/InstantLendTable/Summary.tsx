import React, { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { map, sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'
import { useWalletModal } from '@banx/components/WalletModal'

import { Loan } from '@banx/api/core'
import { calcWeightedAverage, calculateLoanRepayValue } from '@banx/utils'

import { calcWeeklyInterestFee } from './helpers'
import { useInstantTransactions } from './hooks'

import styles from './InstantLendTable.module.less'

interface SummaryProps {
  loans: Loan[]
  selectedLoans: Loan[]
  onSelectLoans: (loans: Loan[]) => void
  onDeselectAllLoans: () => void
}

export const Summary: FC<SummaryProps> = ({ loans, selectedLoans, onSelectLoans }) => {
  const wallet = useWallet()

  const { toggleVisibility } = useWalletModal()

  const { refinanceAll } = useInstantTransactions()

  const totalDebt = sumBy(selectedLoans, (loan) => calculateLoanRepayValue(loan))
  const totalLoanValue = map(selectedLoans, (loan) => loan.fraktBond.borrowedAmount)
  const totalWeeklyInterest = sumBy(selectedLoans, (loan) => calcWeeklyInterestFee(loan))

  const totalApr = map(selectedLoans, (loan) => loan.bondTradeTransaction.amountOfBonds / 100)
  const weightedApr = calcWeightedAverage(totalApr, totalLoanValue)
  const cappedWeightedApr = weightedApr

  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (wallet.connected) {
      refinanceAll()
    } else {
      toggleVisibility()
    }
    event.stopPropagation()
  }

  const handleLoanSelection = (value = 0) => {
    onSelectLoans(loans.slice(0, value))
  }

  return (
    <div className={styles.summary}>
      <div className={styles.mainStat}>
        <p>{selectedLoans.length}</p>
        <p>Loans selected</p>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Total to lend" value={<DisplayValue value={totalDebt} />} />
        <StatInfo label="Weekly interest" value={<DisplayValue value={totalWeeklyInterest} />} />
        <StatInfo label="Weighted apr" value={cappedWeightedApr} valueType={VALUES_TYPES.PERCENT} />
      </div>
      <div className={styles.summaryControls}>
        <CounterSlider
          value={selectedLoans.length}
          onChange={(value) => handleLoanSelection(value)}
          max={loans.length}
          className={styles.sliderContainer}
        />
        <Button
          className={styles.lendButton}
          onClick={onClickHandler}
          disabled={!selectedLoans.length}
        >
          Lend <DisplayValue value={totalDebt} />
        </Button>
      </div>
    </div>
  )
}
