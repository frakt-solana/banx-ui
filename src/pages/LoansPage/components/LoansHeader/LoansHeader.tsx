import { FC } from 'react'

import { sumBy } from 'lodash'

import {
  AdditionalStat,
  MainStat,
  PageHeaderBackdrop,
  SeparateStatsLine,
} from '@banx/components/PageHeader'
import { VALUES_TYPES } from '@banx/components/StatInfo'

import { calculateLoanRepayValue } from '@banx/utils'

import { useWalletLoansAndOffers } from '../../hooks'

const LoansHeader: FC = () => {
  const { loans } = useWalletLoansAndOffers()

  const numberOfLoans = loans.length
  const totalBorrowed = sumBy(loans, (loan) => loan.fraktBond.borrowedAmount)
  const totalDebt = sumBy(loans, (loan) => calculateLoanRepayValue(loan))

  return (
    <PageHeaderBackdrop title="My loans">
      <AdditionalStat label="Loans" value={numberOfLoans} valueType={VALUES_TYPES.STRING} />
      <AdditionalStat label="Total borrowed" value={totalBorrowed} divider={1e9} />
      <SeparateStatsLine />
      <MainStat label="Total debt" value={totalDebt} divider={1e9} />
    </PageHeaderBackdrop>
  )
}

export default LoansHeader
