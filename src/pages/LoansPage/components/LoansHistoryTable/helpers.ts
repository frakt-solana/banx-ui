import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import { capitalize } from 'lodash'
import moment from 'moment'

import { BorrowerActivity } from '@banx/api/activity'
import { STATUS_LOANS_MAP } from '@banx/utils'

const formatAmount = (amount: number) => (amount / 1e9)?.toFixed(2)

const isPerpetualLiquidatedByClaim = (status: string) =>
  status === BondTradeTransactionV2State.PerpetualLiquidatedByClaim

export const formatLoanData = (loan: BorrowerActivity) => {
  const { nftName, borrowed, interest, status, repaid } = loan

  const borrowedAmount = formatAmount(borrowed)
  const totalDebt = formatAmount(borrowed + interest)
  const loanStatus = capitalize(STATUS_LOANS_MAP[status])

  const isLiquidatedByClaim = isPerpetualLiquidatedByClaim(status)
  const repaidAmount = isLiquidatedByClaim ? 'Collateral' : formatAmount(repaid)
  const feeAmount = formatAmount(loan.interest)

  const formattedDate = moment.unix(loan.timestamp).format('DD / MM / YY')

  return {
    nftName,
    borrowed: borrowedAmount,
    debt: totalDebt,
    fee: feeAmount,
    loanStatus,
    repaid: repaidAmount,
    when: formattedDate,
  }
}
