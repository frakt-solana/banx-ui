import { FC, useMemo } from 'react'

import { Button } from '@banx/components/Buttons'

import { core } from '@banx/api/nft'
import { useModal } from '@banx/store/common'
import { isLoanTerminating, isOfferNotEmpty } from '@banx/utils'

import { RefinanceModal } from './RefinanceModal'
import { RepayModal } from './RepayModal'

import styles from './ActionsCell.module.less'

interface ActionsCellProps {
  loan: core.Loan
  offers: Record<string, core.Offer[]>
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
        size={isCardView ? 'large' : 'medium'}
        variant="secondary"
        disabled={disableActions || !refinanceAvailable}
        onClick={(event) => {
          open(RefinanceModal, { loan })
          event.stopPropagation()
        }}
      >
        {isTerminatingStatus ? 'Extend' : 'Rollover'}
      </Button>
      <Button
        className={styles.repayButton}
        size={isCardView ? 'large' : 'medium'}
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
