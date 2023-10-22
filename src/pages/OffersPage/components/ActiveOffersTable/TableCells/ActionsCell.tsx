import { FC, useMemo } from 'react'

import { chain, isEmpty, maxBy, sortBy } from 'lodash'

import { Button } from '@banx/components/Buttons'

import { Loan } from '@banx/api/core'
import {
  calculateLoanRepayValue,
  calculateLoanValue,
  isLoanActiveOrRefinanced,
  isLoanLiquidated,
  isLoanTerminating,
  trackPageEvent,
} from '@banx/utils'

import { useLendLoansTransactions, useLenderLoansAndOffers } from '../hooks'

import styles from '../ActiveOffersTable.module.less'

interface ActionsCellProps {
  loan: Loan
  isCardView: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, isCardView }) => {
  const { fraktBond } = loan

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

  const onTerminate = () => {
    trackPageEvent('myoffers', 'activetab-terminate')
    terminateLoan()
  }

  const onInstant = () => {
    trackPageEvent('myoffers', 'activetab-instantrefinance')
    instantLoan()
  }

  const onClaim = () => {
    trackPageEvent('myoffers', 'activetab-claim')
    claimLoan()
  }

  const buttonSize = isCardView ? 'large' : 'small'

  const loanActiveOrRefinanced = isLoanActiveOrRefinanced(loan)
  const isTerminatingStatus = isLoanTerminating(loan)
  const isLoanExpired = isLoanLiquidated(loan)

  const hasRefinanceOffers = !isEmpty(bestOffer)
  const canRefinance = hasRefinanceOffers && loanActiveOrRefinanced

  const showClaimButton = isLoanExpired && isTerminatingStatus
  const showTerminateButton = (!canRefinance || isTerminatingStatus) && !showClaimButton
  const showInstantButton = canRefinance && !showClaimButton

  return (
    <div className={styles.actionsButtons}>
      {showTerminateButton && (
        <Button
          onClick={onTerminate}
          disabled={isTerminatingStatus}
          variant="secondary"
          size={buttonSize}
        >
          Terminate
        </Button>
      )}

      {showInstantButton && (
        <Button onClick={onInstant} variant="secondary" size={buttonSize}>
          Instant
        </Button>
      )}
      {showClaimButton && (
        <Button onClick={onClaim} size={buttonSize}>
          Claim NFT
        </Button>
      )}
    </div>
  )
}

export default ActionsCell
