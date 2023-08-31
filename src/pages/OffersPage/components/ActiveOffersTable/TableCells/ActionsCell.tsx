import { FC, useMemo } from 'react'

import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, isEmpty, maxBy, sortBy } from 'lodash'

import { Button } from '@banx/components/Buttons'

import { Loan } from '@banx/api/core'
import { calculateLoanValue } from '@banx/utils'

import { isLoanExpired } from '../helpers'
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
      .filter((offer) => calculateLoanValue(offer) > fraktBond.currentPerpetualBorrowed)
      .value()

    const sortedOffers = sortBy(filteredOffers, 'fundsSolOrTokenBalance')

    return sortedOffers[0]
  }, [offers, fraktBond, optimisticOffers])

  const { terminateLoan, claimLoan, instantLoan } = useLendLoansTransactions({
    loan,
    bestOffer,
    updateOrAddLoan,
    updateOrAddOffer,
    addMints,
  })

  const isActiveLoan = bondTradeTransactionState === isPerpetualActive
  const isTerminatingLoan = bondTradeTransactionState === isPerpetualTerminating
  const availableToRefinance = isActiveLoan && !isEmpty(bestOffer)
  const isExpiredLoan = isLoanExpired(loan)

  const buttonSize = isCardView ? 'large' : 'small'

  return (
    <div className={styles.actionsButtons}>
      {isActiveLoan || (isTerminatingLoan && !isExpiredLoan) ? (
        <>
          <Button
            onClick={terminateLoan}
            className={styles.terminateButton}
            disabled={isTerminatingLoan}
            variant="secondary"
            size={buttonSize}
          >
            Terminate
          </Button>
          <Button
            onClick={instantLoan}
            className={styles.instantButton}
            disabled={!availableToRefinance}
            variant="secondary"
            size={buttonSize}
          >
            Instant
          </Button>
        </>
      ) : (
        <Button onClick={claimLoan} className={styles.instantButton} size={buttonSize}>
          Claim NFT
        </Button>
      )}
    </div>
  )
}

export default ActionsCell
