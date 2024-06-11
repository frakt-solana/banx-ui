import { FC, useMemo } from 'react'

import { Button } from '@banx/components/Buttons'

import { Offer } from '@banx/api/nft'
import { core } from '@banx/api/tokens'
import { useModal } from '@banx/store/common'
import { isOfferNotEmpty, isTokenLoanTerminating } from '@banx/utils'

import { RepayModal } from './RepayModal'

import styles from './ActionsCell.module.less'

interface ActionsCellProps {
  loan: core.TokenLoan
  offers: Record<string, Offer[]>
  isCardView: boolean
  disableActions: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, offers, isCardView, disableActions }) => {
  const isLoanTerminating = isTokenLoanTerminating(loan)

  const { open } = useModal()

  const refinanceAvailable = useMemo(() => {
    const offersByMarket = offers[loan.fraktBond.hadoMarket || '']
    return !!offersByMarket?.filter(isOfferNotEmpty).length
  }, [offers, loan])

  const buttonSize = isCardView ? 'default' : 'small'

  return (
    <div className={styles.actionsButtons}>
      <Button
        className={styles.refinanceButton}
        size={buttonSize}
        variant="secondary"
        disabled={disableActions || !refinanceAvailable}
        // onClick={(event) => {
        //   open(RefinanceModal, { loan })
        //   event.stopPropagation()
        // }}
      >
        {isLoanTerminating ? 'Extend' : 'Reborrow'}
      </Button>
      <Button
        className={styles.repayButton}
        size={buttonSize}
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
