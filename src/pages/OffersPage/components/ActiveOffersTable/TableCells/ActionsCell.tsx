import { FC, useMemo } from 'react'

import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, isEmpty, maxBy, sortBy } from 'lodash'

import { Button } from '@banx/components/Buttons'

import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue, calculateLoanValue, isLoanLiquidated } from '@banx/utils'

import { useLendLoansTransactions, useLenderLoansAndOffers } from '../hooks'

import styles from '../ActiveOffersTable.module.less'

interface ActionsCellProps {
  loan: Loan
  isCardView: boolean
}

const isPerpetualActive = BondTradeTransactionV2State.PerpetualActive
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

  const isActiveLoan = bondTradeTransactionState === isPerpetualActive
  const isTerminatingLoan = bondTradeTransactionState === isPerpetualTerminating
  const isLoadExpired = isLoanLiquidated(loan)

  const hasRefinanceOffers = !isEmpty(bestOffer)
  const canRefinance = hasRefinanceOffers && isActiveLoan

  const showTerminateButton = (!canRefinance || isTerminatingLoan) && !isLoadExpired
  const showInstantButton = canRefinance && !isLoadExpired

  return (
    <div className={styles.actionsButtons}>
      {showTerminateButton && (
        <Button
          className={styles.terminateButton}
          onClick={terminateLoan}
          disabled={isTerminatingLoan}
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
      {isLoadExpired && (
        <Button onClick={claimLoan} className={styles.instantButton} size={buttonSize}>
          Claim NFT
        </Button>
      )}
    </div>
  )
}

export default ActionsCell
