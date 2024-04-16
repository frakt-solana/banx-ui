import { FC } from 'react'

import { sumBy } from 'lodash'

import { OnboardButton } from '@banx/components/Buttons'
import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'
import { DisplayValue } from '@banx/components/TableComponents'

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
      <AdditionalStat label="Loans" value={numberOfLoans} />
      <AdditionalStat label="Borrowed" value={<DisplayValue value={totalBorrowed} />} />
      <AdditionalStat
        label="Weekly interest"
        value={<DisplayValue value={totalWeeklyFee} />}
        tooltipText="Expected weekly interest on your loans. Interest is added to your debt balance"
        tooltipPlacement="bottomLeft"
      />
      <SeparateStatsLine />
      <MainStat label="Debt" value={<DisplayValue value={totalDebt} />} />
    </PageHeaderBackdrop>
  )
}

export default LoansHeader
