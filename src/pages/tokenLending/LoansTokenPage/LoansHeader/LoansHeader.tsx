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
import { TokenSwitcher } from '@banx/components/TokenSwitcher'

import { core } from '@banx/api/tokens'
import { caclulateBorrowTokenLoanValue, calcTokenWeeklyFeeWithRepayFee } from '@banx/utils'

interface LoansHeaderProps {
  loans: core.TokenLoan[]
}

const LoansHeader: FC<LoansHeaderProps> = ({ loans }) => {
  const numberOfLoans = loans.length
  const totalBorrowed = sumBy(loans, (loan) => loan.fraktBond.borrowedAmount)
  const totalDebt = sumBy(loans, (loan) => caclulateBorrowTokenLoanValue(loan).toNumber())
  const totalWeeklyFee = sumBy(loans, calcTokenWeeklyFeeWithRepayFee)

  return (
    <PageHeaderBackdrop
      title="My loans"
      titleBtn={<OnboardButton contentType="loans" />}
      tokenSwitcher={<TokenSwitcher title="My loans" />}
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
