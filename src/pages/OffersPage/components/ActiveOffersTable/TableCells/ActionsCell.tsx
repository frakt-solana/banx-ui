import { FC, useMemo } from 'react'

import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, isEmpty, maxBy, sortBy } from 'lodash'

import { Button } from '@banx/components/Buttons'

import { Loan } from '@banx/api/core'
import {
  calculateLoanRepayValue,
  calculateLoanValue,
  isLoanActive,
  isLoanLiquidated,
} from '@banx/utils'

import { useLendLoansTransactions, useLenderLoansAndOffers } from '../hooks'

import styles from '../ActiveOffersTable.module.less'

interface ActionsCellProps {
  loan: Loan
  isCardView: boolean
}

const isPerpetualTerminating = BondTradeTransactionV2State.PerpetualManualTerminating

export const ActionsCell: FC<ActionsCellProps> = ({ loan, isCardView }) => {
  const { bondTradeTransaction, fraktBond } = loan
  const { bondTradeTransactionState } = bondTradeTransaction

  const { offers, addMints, updateOrAddLoan, updateOrAddOffer, optimisticOffers } =
    useLenderLoansAndOffers()

  const bestOffer = useMemo(() => {
    const offersByMarket = offers[fraktBond.hadoMarket || '']

    const combinedOffers = [...optimisticOffers, ...(offersByMarket ?? [])]

    const filteredOffers = chain(combinedOffers)
      .groupBy('publicKey')
      .map((offers) => maxBy(offers, 'lastTransactedAt'))
      .compact()
      .filter((offer) => calculateLoanValue(offer) > calculateLoanRepayValue(loan))
      .value()

    const sortedOffers = sortBy(filteredOffers, 'fundsSolOrTokenBalance')

    return sortedOffers[0]
  }, [offers, fraktBond, optimisticOffers, loan])

  const { terminateLoan, claimLoan, instantLoan } = useLendLoansTransactions({
    loan,
    bestOffer,
    updateOrAddLoan,
    updateOrAddOffer,
    addMints,
  })

  const buttonSize = isCardView ? 'large' : 'small'

  const loanActive = isLoanActive(loan)
  const isLoanTerminating = bondTradeTransactionState === isPerpetualTerminating
  const isLoanExpired = isLoanLiquidated(loan)

  const hasRefinanceOffers = !isEmpty(bestOffer)
  const canRefinance = hasRefinanceOffers && loanActive

  const showTerminateButton = (!canRefinance || isLoanTerminating) && !isLoanExpired
  const showInstantButton = canRefinance && !isLoanExpired

  return (
    <div className={styles.actionsButtons}>
      {showTerminateButton && (
        <Button
          className={styles.terminateButton}
          onClick={terminateLoan}
          disabled={isLoanTerminating}
          variant="secondary"
          size={buttonSize}
        >
          Terminate
        </Button>
      )}

      {showInstantButton && (
        <Button
          onClick={instantLoan}
          className={styles.instantButton}
          variant="secondary"
          size={buttonSize}
        >
          Instant
        </Button>
      )}
      {isLoanExpired && (
        <Button onClick={claimLoan} className={styles.instantButton} size={buttonSize}>
          Claim NFT
        </Button>
      )}
    </div>
  )
}

export default ActionsCell
