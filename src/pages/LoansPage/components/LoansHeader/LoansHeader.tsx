import { FC } from 'react'

import { sumBy } from 'lodash'

import { OnboardButton } from '@banx/components/Buttons'
import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { Loan } from '@banx/api/core'
import { calcWeeklyFeeWithRepayFee, calculateLoanRepayValue } from '@banx/utils'

interface LoansHeaderProps {
  loans: Loan[]
}

const LoansHeader: FC<LoansHeaderProps> = ({ loans }) => {
  const numberOfLoans = loans.length
  const totalBorrowed = sumBy(loans, (loan) => loan.fraktBond.borrowedAmount)
  const totalDebt = sumBy(loans, calculateLoanRepayValue)
  const totalWeeklyFee = sumBy(loans, calcWeeklyFeeWithRepayFee)

  return (
    <PageHeaderBackdrop
      title="My loans"
      titleBtn={<OnboardButton contentType="loans" title="My loans" />}
    >
      <AdditionalStat label="Loans" value={numberOfLoans} valueType={VALUES_TYPES.STRING} />
      <AdditionalStat label="Borrowed" value={totalBorrowed} divider={1e9} />
      <AdditionalStat
        label="Weekly interest"
        tooltipText="Expected weekly interest on your loans. Interest is added to your debt balance"
        tooltipPlacement="bottomLeft"
        value={totalWeeklyFee}
        divider={1e9}
      />
      <SeparateStatsLine />
      <MainStat label="Debt" value={totalDebt} divider={1e9} />
    </PageHeaderBackdrop>
  )
}

export default LoansHeader
