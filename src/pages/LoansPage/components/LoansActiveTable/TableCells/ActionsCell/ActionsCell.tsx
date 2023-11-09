import { FC, useMemo } from 'react'

import { chain } from 'lodash'

import { Button } from '@banx/components/Buttons'

import { Loan, Offer } from '@banx/api/core'
import { useModal } from '@banx/store'
import { isLoanTerminating } from '@banx/utils'

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

  const offerToRefinance = useMemo(() => {
    const offersByMarket = offers[fraktBond.hadoMarket || '']
    return chain(offersByMarket)
      .sortBy(offersByMarket, 'currentSpotPrice')
      .filter(isOfferNotEmpty)
      .reverse()
      .value()
      .at(0)
  }, [offers, fraktBond])

  return (
    <div className={styles.actionsButtons}>
      <Button
        className={styles.refinanceButton}
        size={isCardView ? 'medium' : 'small'}
        variant="secondary"
        disabled={disableActions || !offerToRefinance}
        onClick={(event) => {
          open(RefinanceModal, { loan, offer: offerToRefinance })
          event.stopPropagation()
        }}
      >
        {isTerminatingStatus ? 'Extend' : 'Reborrow'}
      </Button>
      <Button
        className={styles.repayButton}
        size={isCardView ? 'medium' : 'small'}
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

const isOfferNotEmpty = (offer: Offer) => {
  const { fundsSolOrTokenBalance, currentSpotPrice } = offer
  const fullOffersAmount = Math.floor(fundsSolOrTokenBalance / currentSpotPrice)
  if (fullOffersAmount >= 1) return true
  const decimalLoanValue = fundsSolOrTokenBalance - currentSpotPrice * fullOffersAmount
  if (decimalLoanValue > 0) return true
  return false
}
