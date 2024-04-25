import React, { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { map, sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'
import { useWalletModal } from '@banx/components/WalletModal'

import { Loan } from '@banx/api/core'
import {
  HealthColorIncreasing,
  calcWeightedAverage,
  calculateLoanRepayValue,
  getColorByPercent,
} from '@banx/utils'

import { calcWeeklyInterestFee } from './helpers'
import { useInstantTransactions } from './hooks'
import { useLoansState } from './loansState'

import styles from './InstantLendTable.module.less'

export const Summary: FC<{ loans: Loan[] }> = ({ loans }) => {
  const wallet = useWallet()
  const { toggleVisibility } = useWalletModal()
  const { refinanceAll } = useInstantTransactions()
  const { selectedLoans, onSelectLoans } = useLoansState()

  const { totalDebt, totalWeeklyInterest, weightedApr, weightedLtv } =
    calculateSummaryInfo(selectedLoans)

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
        <p>{createPercentValueJSX(weightedApr, '0%')}</p>
        <p>Weighted apr</p>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo
          label="Weighted ltv"
          value={weightedLtv}
          valueStyles={{ color: getColorByPercent(weightedLtv, HealthColorIncreasing) }}
          valueType={VALUES_TYPES.PERCENT}
        />
        <StatInfo label="Weekly interest" value={<DisplayValue value={totalWeeklyInterest} />} />
        <StatInfo
          label="Weighted apr"
          value={weightedApr}
          valueType={VALUES_TYPES.PERCENT}
          classNamesProps={{ container: styles.weightedAprStat }}
        />
      </div>
      <div className={styles.summaryControls}>
        <CounterSlider
          label="# Loans"
          value={selectedLoans.length}
          onChange={(value) => handleLoanSelection(value)}
          max={loans.length}
          className={styles.sliderContainer}
          rootClassName={styles.slider}
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

const calculateSummaryInfo = (loans: Loan[]) => {
  const totalDebt = sumBy(loans, (loan) => calculateLoanRepayValue(loan))
  const totalLoanValue = map(loans, (loan) => loan.fraktBond.borrowedAmount)
  const totalWeeklyInterest = sumBy(loans, (loan) => calcWeeklyInterestFee(loan))

  const totalAprArray = map(loans, (loan) => loan.bondTradeTransaction.amountOfBonds / 100)
  const totalLtvArray = map(
    loans,
    (loan) => (calculateLoanRepayValue(loan) / loan.nft.collectionFloor) * 100,
  )

  const weightedApr = calcWeightedAverage(totalAprArray, totalLoanValue)
  const weightedLtv = calcWeightedAverage(totalLtvArray, totalLoanValue)

  return { totalDebt, totalWeeklyInterest, weightedApr, weightedLtv }
}
