import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import { capitalize } from 'lodash'
import moment from 'moment'

import { LenderActivity } from '@banx/api/activity'
import { STATUS_LOANS_MAP, convertAprToApy } from '@banx/utils'

const formatAmount = (amount: number) => (amount / 1e9)?.toFixed(2)

const isPerpetualLiquidatedByClaim = (status: string) =>
  status === BondTradeTransactionV2State.PerpetualLiquidatedByClaim

export const formatLoanData = (loan: LenderActivity) => {
  const { nftName, interest, status, apr, received, currentRemainingLentAmount } = loan

  const lentAmount = formatAmount(currentRemainingLentAmount)
  const interestAmount = formatAmount(interest)
  const apyAmount = convertAprToApy(apr / 1e4)

  const loanStatus = capitalize(STATUS_LOANS_MAP[status])

  const isLiquidatedByClaim = isPerpetualLiquidatedByClaim(status)
  const receivedAmount = isLiquidatedByClaim ? 'Collateral' : formatAmount(received)

  const formattedDate = moment.unix(loan.timestamp).format('DD / MM / YY')

  return {
    nftName,
    lent: lentAmount,
    interest: interestAmount,
    apr: apyAmount,
    loanStatus,
    received: receivedAmount,
    when: formattedDate,
  }
}
