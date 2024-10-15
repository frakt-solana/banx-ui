import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { web3 } from 'fbonds-core'
import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'
import { map, sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { TokenLoan } from '@banx/api/tokens'
import { calcWeightedAverage, calculateTokenLoanLtvByLoanValue } from '@banx/utils'

import { useTokenLoanListingsTransactions } from './hooks'
import { TokenLoanOptimistic } from './loansState'

import styles from './TokenLoanListingsTable.module.less'

interface SummaryProps {
  loans: TokenLoan[]
  selectedLoans: TokenLoanOptimistic[]
  setSelection: (loans: TokenLoan[], walletPublicKey: string) => void
}

export const Summary: FC<SummaryProps> = ({
  loans,
  selectedLoans: rawSelectedLoans,
  setSelection,
}) => {
  const { publicKey: walletPublicKey } = useWallet()

  const { delistAll } = useTokenLoanListingsTransactions()

  const selectedLoans = useMemo(() => {
    return rawSelectedLoans.map(({ loan }) => loan)
  }, [rawSelectedLoans])

  const totalSelectedLoans = selectedLoans.length
  const totalBorrow = sumBy(selectedLoans, (loan) => loan.fraktBond.borrowedAmount)

  const weightedApr = calculateWeightedApr(selectedLoans)
  const weightedLtv = calculateWeightedLtv(selectedLoans)

  const handleLoanSelection = (value = 0) => {
    setSelection(loans.slice(0, value), walletPublicKey?.toBase58() || '')
  }

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
        <StatInfo label="Weighted ltv" value={weightedLtv} valueType={VALUES_TYPES.PERCENT} />
        <StatInfo label="Borrow" value={<DisplayValue value={totalBorrow} />} />
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
          className={classNames(styles.delistButton, styles.delistAllButton)}
          onClick={delistAll}
          disabled={!totalSelectedLoans}
        >
          Delist
        </Button>
      </div>
    </div>
  )
}

const calculateWeightedApr = (loans: TokenLoan[]) => {
  const totalAprValues = map(loans, (loan) => {
    const marketPubkey = new web3.PublicKey(loan.fraktBond.hadoMarket)
    return calcBorrowerTokenAPR(loan.bondTradeTransaction.amountOfBonds, marketPubkey) / 100
  })

  const totalRepayValues = map(loans, (loan) => loan.fraktBond.borrowedAmount)

  return calcWeightedAverage(totalAprValues, totalRepayValues)
}

const calculateWeightedLtv = (loans: TokenLoan[]) => {
  const totalLtvValues = loans.map((loan) => {
    const loanValue = loan.fraktBond.borrowedAmount
    return calculateTokenLoanLtvByLoanValue(loan, loanValue)
  })

  const totalRepayValues = map(loans, (loan) => loan.fraktBond.borrowedAmount)

  return calcWeightedAverage(totalLtvValues, totalRepayValues)
}
