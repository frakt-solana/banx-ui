import { FC, useMemo } from 'react'

import { Button } from '@banx/components/Buttons'

import { Loan, Offer } from '@banx/api/core'
import { useModal } from '@banx/store'
import { isLoanTerminating, isOfferNotEmpty } from '@banx/utils'

import { RefinanceModal } from './RefinanceModal'
import { RepayModal } from './RepayModal'

import styles from './ActionsCell.module.less'

interface ActionsCellProps {
  loan: Loan
  offers: Record<string, Offer[]>
  isCardView: boolean
  disableActions: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, offers, isCardView, disableActions }) => {
  const { fraktBond } = loan

  const { open } = useModal()

  const isTerminatingStatus = isLoanTerminating(loan)

  const refinanceAvailable = useMemo(() => {
    const offersByMarket = offers[fraktBond.hadoMarket || '']
    return !!offersByMarket?.filter(isOfferNotEmpty).length
  }, [offers, fraktBond])

  return (
    <div className={styles.actionsButtons}>
      <Button
        className={styles.refinanceButton}
        size={isCardView ? 'default' : 'small'}
        variant="secondary"
        disabled={disableActions || !refinanceAvailable}
        onClick={(event) => {
          open(RefinanceModal, { loan })
          event.stopPropagation()
        }}
      >
        {isTerminatingStatus ? 'Extend' : 'Reborrow'}
      </Button>
      <Button
        className={styles.repayButton}
        size={isCardView ? 'default' : 'small'}
        disabled={disableActions}
        onClick={(event) => {
          open(RepayModal, { loan })
          event.stopPropagation()
        }}
      >
        Repay
      </Button>
    </div>
  )
}
