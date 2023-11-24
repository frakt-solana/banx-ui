import { FC, useMemo } from 'react'

import { isEmpty } from 'lodash'

import { Button } from '@banx/components/Buttons'

import { Loan, Offer } from '@banx/api/core'
import {
  isLoanActiveOrRefinanced,
  isLoanLiquidated,
  isLoanTerminating,
  trackPageEvent,
} from '@banx/utils'

import { findBestOffer } from '../helpers'
import { useHiddenNftsMints, useLendLoansTransactions, useOptimisticOffers } from '../hooks'

import styles from '../ActiveOffersTable.module.less'

interface ActionsCellProps {
  loan: Loan
  offers: Record<string, Offer[]>
  updateOrAddOffer: (offer: Offer) => void
  updateOrAddLoan: (loan: Loan) => void
}

export const ActionsCell: FC<ActionsCellProps> = ({
  loan,
  offers,
  updateOrAddOffer,
  updateOrAddLoan,
}) => {
  const { offers: optimisticOffers } = useOptimisticOffers()
  const { addMints } = useHiddenNftsMints()

  const bestOffer = useMemo(() => {
    return findBestOffer({ loan, offers, optimisticOffers })
  }, [offers, optimisticOffers, loan])

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
          className={styles.actionButton}
          onClick={onTerminate}
          disabled={isTerminatingStatus}
          variant="secondary"
          size="small"
        >
          Terminate
        </Button>
      )}

      {showInstantButton && (
        <Button
          className={styles.actionButton}
          onClick={onInstant}
          variant="secondary"
          size="small"
        >
          Instant
        </Button>
      )}
      {showClaimButton && (
        <Button className={styles.actionButton} onClick={onClaim}>
          Claim NFT
        </Button>
      )}
    </div>
  )
}

export default ActionsCell
