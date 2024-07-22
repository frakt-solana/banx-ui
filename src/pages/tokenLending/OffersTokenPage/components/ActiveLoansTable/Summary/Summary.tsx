import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { reduce } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import {
  HealthColorIncreasing,
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

  const { totalLent, averageLtv, totalInterest } = getTerminateStatsInfo(selectedLoans)

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
          variant="text"
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
            classNamesProps={{ container: styles.lentAmountStat }}
            label="Lent amount"
            value={<DisplayValue value={totalLent} />}
          />
          <StatInfo
            label="Avg ltv"
            value={averageLtv}
            valueType={VALUES_TYPES.PERCENT}
            valueStyles={{
              color: averageLtv ? getColorByPercent(averageLtv, HealthColorIncreasing) : '',
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
            onClick={() => terminateTokenLoans(loansToTerminate)}
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
  return reduce(
    loans,
    (acc, loan) => {
      const claimValue = calculateLentTokenValueWithInterest(loan).toNumber()
      const borrowedAmount = calculateTokenLoanValueWithUpfrontFee(loan).toNumber()
      const ltvPercent = calculateTokenLoanLtvByLoanValue(loan, claimValue)

      return {
        totalLent: acc.totalLent + borrowedAmount,
        averageLtv: acc.averageLtv + ltvPercent / loans.length,
        totalInterest: acc.totalInterest + claimValue - borrowedAmount,
      }
    },
    { totalLent: 0, averageLtv: 0, totalInterest: 0 },
  )
}
