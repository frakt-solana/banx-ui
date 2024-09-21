import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { map, sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import {
  HealthColorIncreasing,
  calcWeightedAverage,
  calculateLentTokenValueWithInterest,
  calculateTokenLoanLtvByLoanValue,
  calculateTokenLoanValueWithUpfrontFee,
  getColorByPercent,
} from '@banx/utils'

import { useTokenLenderLoansTransactions } from '../hooks'

import styles from './Summary.module.less'

interface SummaryProps {
  loansToClaim: core.TokenLoan[]
  loansToTerminate: core.TokenLoan[]
  selectedLoans: core.TokenLoan[]
  setSelection: (loans: core.TokenLoan[], walletPublicKey: string) => void
}

const Summary: FC<SummaryProps> = ({
  loansToTerminate,
  loansToClaim,
  selectedLoans,
  setSelection,
}) => {
  const wallet = useWallet()
  const walletPublicKeyString = wallet.publicKey?.toBase58() || ''

  const { claimTokenLoans, terminateTokenLoans } = useTokenLenderLoansTransactions()

  const { totalLent, weightedApr, weightedLtv, totalInterest } =
    getTerminateStatsInfo(selectedLoans)

  const handleLoanSelection = (value = 0) => {
    setSelection(loansToTerminate.slice(0, value), walletPublicKeyString)
  }

  return (
    <div className={styles.container}>
      {!!loansToClaim.length && (
        <Button
          className={styles.claimButton}
          onClick={() => claimTokenLoans(loansToClaim)}
          type="circle"
          variant="tertiary"
        >
          Claim defaults
        </Button>
      )}

      <div className={styles.content}>
        <div className={styles.mainStat}>
          <p>
            <DisplayValue value={totalLent} />
          </p>
          <p>Lent amount</p>
        </div>

        <div className={styles.additionalStats}>
          <StatInfo
            label="Lent amount"
            value={<DisplayValue value={totalLent} />}
            classNamesProps={{ container: styles.lentAmountStat }}
          />
          <StatInfo
            label="Avg apr"
            value={weightedApr}
            valueType={VALUES_TYPES.PERCENT}
            classNamesProps={{ value: weightedApr ? styles.aprValueStat : '' }}
          />
          <StatInfo
            label="Avg ltv"
            value={weightedLtv}
            valueType={VALUES_TYPES.PERCENT}
            valueStyles={{
              color: weightedLtv ? getColorByPercent(weightedLtv, HealthColorIncreasing) : '',
            }}
          />
          <StatInfo label="interest" value={<DisplayValue value={totalInterest} />} />
        </div>

        <div className={styles.terminateControls}>
          <CounterSlider
            label="# Loans"
            value={selectedLoans.length}
            onChange={(value) => handleLoanSelection(value)}
            disabled={!loansToTerminate.length}
            className={styles.terminateSliderWrapper}
            max={loansToTerminate.length}
          />
          <Button
            className={classNames(styles.summaryButton, styles.terminateButton)}
            onClick={() => terminateTokenLoans(selectedLoans)}
            disabled={!selectedLoans.length}
            variant="secondary"
          >
            Terminate
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Summary

const getTerminateStatsInfo = (loans: core.TokenLoan[]) => {
  const totalAprArray = map(loans, (loan) => loan.bondTradeTransaction.amountOfBonds / 100)
  const totalLentArray = map(loans, (loan) => calculateLentTokenValueWithInterest(loan).toNumber())

  const totalLtvArray = map(loans, (loan) => {
    const claimValue = calculateLentTokenValueWithInterest(loan).toNumber()
    return calculateTokenLoanLtvByLoanValue(loan, claimValue)
  })

  const totalLent = sumBy(loans, (loan) => calculateTokenLoanValueWithUpfrontFee(loan).toNumber())

  const totalInterest = sumBy(loans, (loan) => {
    const claimValue = calculateLentTokenValueWithInterest(loan).toNumber()
    const borrowedAmount = calculateTokenLoanValueWithUpfrontFee(loan).toNumber()
    return claimValue - borrowedAmount
  })

  const weightedApr = calcWeightedAverage(totalAprArray, totalLentArray)
  const weightedLtv = calcWeightedAverage(totalLtvArray, totalLentArray)

  return {
    totalLent,
    totalInterest,
    weightedLtv,
    weightedApr,
  }
}
