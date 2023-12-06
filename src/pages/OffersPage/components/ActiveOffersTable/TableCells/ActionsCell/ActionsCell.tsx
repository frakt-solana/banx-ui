import { FC, useMemo } from 'react'

import { isEmpty } from 'lodash'

import { Button } from '@banx/components/Buttons'

import { Loan, Offer } from '@banx/api/core'
import { useModal } from '@banx/store'
import {
  isLoanActiveOrRefinanced,
  isLoanLiquidated,
  isLoanTerminating,
  trackPageEvent,
} from '@banx/utils'

import { findBestOffer } from '../../helpers'
import { useHiddenNftsMints, useLendLoansTransactions, useOptimisticOffers } from '../../hooks'
import { ManageModal } from './ManageModal'

import styles from './ActionsCell.module.less'

interface ActionsCellProps {
  loan: Loan
  offers: Record<string, Offer[]>
  isCardView: boolean
  updateOrAddOffer: (offer: Offer) => void
  updateOrAddLoan: (loan: Loan) => void
}

export const ActionsCell: FC<ActionsCellProps> = ({
  loan,
  offers,
  isCardView,
  updateOrAddOffer,
  updateOrAddLoan,
}) => {
  const { open } = useModal()

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

  const buttonSize = isCardView ? 'medium' : 'small'

  const loanActiveOrRefinanced = isLoanActiveOrRefinanced(loan)
  const isTerminatingStatus = isLoanTerminating(loan)
  const isLoanExpired = isLoanLiquidated(loan)

  const canRefinance = !isEmpty(bestOffer) && loanActiveOrRefinanced

  const canClaim = isLoanExpired && isTerminatingStatus
  const canTerminate = (!canRefinance || isTerminatingStatus) && !canClaim
  const canInstant = canRefinance && !canClaim

  const showModal = () => {
    open(ManageModal, {
      loan,
      onTerminate: canTerminate ? onTerminate : undefined,
      onInstant: canInstant ? onInstant : undefined,
    })
  }

  return (
    <div className={styles.actionsButtons}>
      {canClaim && (
        <Button className={styles.actionButton} onClick={onClaim} size={buttonSize}>
          Claim NFT
        </Button>
      )}
      {!canClaim && (
        <Button
          className={styles.actionButton}
          onClick={showModal}
          disabled={isTerminatingStatus}
          variant="secondary"
          size={buttonSize}
        >
          Manage
        </Button>
      )}
    </div>
  )
}

export default ActionsCell
