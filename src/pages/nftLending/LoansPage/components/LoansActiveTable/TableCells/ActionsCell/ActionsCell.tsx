import { FC, useMemo } from 'react'

import { Button } from '@banx/components/Buttons'

import { coreNew } from '@banx/api/nft'
import { useModal } from '@banx/store/common'
import { isLoanTerminating, isOfferNotEmpty } from '@banx/utils'

import { RefinanceModal } from './RefinanceModal'
import { RepayModal } from './RepayModal'

import styles from './ActionsCell.module.less'

interface ActionsCellProps {
  loan: coreNew.Loan
  offers: Record<string, coreNew.Offer[]>
  isCardView: boolean
  disableActions: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, offers, isCardView, disableActions }) => {
  const { fraktBond } = loan

  const { open } = useModal()

  const isTerminatingStatus = isLoanTerminating(loan)

  const refinanceAvailable = useMemo(() => {
    const offersByMarket = offers[fraktBond.hadoMarket?.toBase58() || '']
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
