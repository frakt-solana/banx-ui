import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'

import { useTokenLoansTransactions } from '../../../LoansTokenActiveTable/hooks'
import { TokenLoanOptimistic } from '../../loansCart'
import { calculateLoansStats, getPayInterestActionText } from './helpers'

import styles from './ExpandedCardContent.module.less'

interface SummaryProps {
  loans: core.TokenLoan[]
  selectedLoansOptimistics: TokenLoanOptimistic[]
  setSelection: (loans: core.TokenLoan[], walletPublicKey: string) => void
}

export const Summary: FC<SummaryProps> = ({ loans, selectedLoansOptimistics, setSelection }) => {
  const { publicKey: walletPublicKey } = useWallet()
  const { repayAllLoans, repayUnpaidLoansInterest } = useTokenLoansTransactions()

  const selectedLoans = useMemo(
    () => selectedLoansOptimistics.map(({ loan }) => loan),
    [selectedLoansOptimistics],
  )

  const { totalSelectedLoans, totalDebt, totalWeeklyFee, totalValueToPay, weightedApr } =
    calculateLoansStats(selectedLoans)

  const handleLoanSelection = (value = 0) => {
    const selectedLoansSubset = loans.slice(0, value)
    setSelection(selectedLoansSubset, walletPublicKey?.toBase58() || '')
  }

  const classNamesProps = {
    container: classNames(styles.summaryAdditionalStat, styles.summaryHiddenStat),
  }

  return (
    <div className={styles.summary}>
      <div className={styles.summaryMainStat}>
        <p>{createPercentValueJSX(weightedApr, '0%')}</p>
        <p>Weighted apr</p>
      </div>

      <div className={styles.summaryAdditionalStats}>
        <StatInfo
          label="Debt"
          value={<DisplayValue value={totalDebt} />}
          classNamesProps={classNamesProps}
        />
        <StatInfo
          label={getPayInterestActionText(selectedLoans)}
          value={<DisplayValue value={totalValueToPay} />}
          classNamesProps={classNamesProps}
        />
        <StatInfo label="Weekly fee" value={<DisplayValue value={totalWeeklyFee} />} />
        <StatInfo
          label="Weighted apr"
          value={weightedApr}
          valueType={VALUES_TYPES.PERCENT}
          classNamesProps={classNamesProps}
        />
      </div>

      <div className={styles.summaryControls}>
        <CounterSlider
          label="# Loans"
          value={totalSelectedLoans}
          onChange={(value) => handleLoanSelection(value)}
          rootClassName={styles.summarySlider}
          className={styles.summarySliderContainer}
          max={loans.length}
        />

        <Button
          onClick={repayUnpaidLoansInterest}
          variant="secondary"
          className={styles.summaryActionButton}
          disabled={!totalValueToPay}
        >
          {getPayInterestActionText(selectedLoans)}
          {<DisplayValue value={totalValueToPay} />}
        </Button>

        <Button
          onClick={repayAllLoans}
          className={styles.summaryActionButton}
          disabled={!totalSelectedLoans}
        >
          Repay <DisplayValue value={totalDebt} />
        </Button>
      </div>
    </div>
  )
}
